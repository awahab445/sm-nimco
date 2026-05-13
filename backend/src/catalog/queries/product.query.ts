import { ProductQueryDto } from '../dto/product-query.dto';
import { AdminProductListQueryDto } from '../dto/admin-product-list-query.dto';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type WhereOmit = 'categories' | 'price' | 'customAttributes' | `attr:${string}`;

export type ProductQueryAttr = Record<string, string[]>;

export type EffectiveProductQuery = Omit<ProductQueryDto, 'brands' | 'sizes' | 'attr'> & {
  /** Merged from `attr` JSON query + legacy `brands` / `sizes` params. */
  attr?: ProductQueryAttr;
};

export type BuildWhereOptions = {
  omit?: Set<WhereOmit>;
};

export function splitCommaList(s?: string): string[] {
  if (!s || typeof s !== 'string') return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseCategoryIds(raw?: string): string[] {
  return splitCommaList(raw).filter((id) => UUID_RE.test(id));
}

/** Read a storefront filter value from product/variant attributes JSON. */
export function readAttributeValue(attrs: unknown, key: string): string | null {
  if (!attrs || typeof attrs !== 'object' || Array.isArray(attrs)) return null;
  const a = attrs as Record<string, unknown>;
  const readScalar = (v: unknown): string | null => {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
    return null;
  };

  const optionValues = a.optionValues ?? a.option_values;
  const nested =
    optionValues && typeof optionValues === 'object' && !Array.isArray(optionValues)
      ? (optionValues as Record<string, unknown>)
      : null;

  if (key === 'size') {
    return (
      readScalar(nested?.size) ??
      readScalar(nested?.Size) ??
      readScalar(a.size) ??
      readScalar(a.Size)
    );
  }

  return readScalar(nested?.[key]) ?? readScalar(a[key]);
}

function attributeJsonPaths(key: string): string[][] {
  if (key === 'size') {
    return [
      ['size'],
      ['Size'],
      ['optionValues', 'size'],
      ['optionValues', 'Size'],
    ];
  }
  return [
    [key],
    ['optionValues', key],
  ];
}

function buildAttributeValueMatch(key: string, value: string): Record<string, unknown>[] {
  const paths = attributeJsonPaths(key);
  const productMatches = paths.map((path) => ({
    attributes: { path, equals: value },
  }));
  const variantMatches = paths.map((path) => ({
    variants: {
      some: {
        isActive: true,
        attributes: { path, equals: value },
      },
    },
  }));
  return [...productMatches, ...variantMatches];
}

function parseAttrQueryString(raw: string): ProductQueryAttr {
  const attr: ProductQueryAttr = {};
  const trimmed = raw.trim();
  const candidates = [trimmed];
  if (trimmed.includes('%')) {
    try {
      candidates.push(decodeURIComponent(trimmed));
    } catch {
      /* ignore */
    }
  }
  for (const candidate of candidates) {
    try {
      const o = JSON.parse(candidate) as unknown;
      if (!o || typeof o !== 'object' || Array.isArray(o)) continue;
      for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
        if (Array.isArray(v)) attr[k] = v.map(String).map((x) => x.trim()).filter(Boolean);
        else if (typeof v === 'string' && v.trim()) attr[k] = splitCommaList(v);
      }
      return attr;
    } catch {
      /* try next candidate */
    }
  }
  return attr;
}

/** Include selected categories and all active descendants (PLP parent browse nodes). */
export async function expandCategoryFilterWithDescendants(
  prisma: { category: { findMany: (args: object) => Promise<Array<{ id: string; parentId: string | null }>> } },
  query: EffectiveProductQuery,
): Promise<EffectiveProductQuery> {
  if (!query.category?.trim()) return query;
  const roots = parseCategoryIds(query.category);
  if (!roots.length) return query;

  const all = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, parentId: true },
  });
  const byParent = new Map<string | null, string[]>();
  for (const c of all) {
    const key = c.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c.id);
  }

  const expanded = new Set<string>();
  const walk = (id: string) => {
    expanded.add(id);
    for (const child of byParent.get(id) ?? []) walk(child);
  };
  for (const id of roots) walk(id);

  return { ...query, category: [...expanded].join(',') };
}

export function parsePriceRangeString(price?: string): { min: number; max: number } | null {
  if (!price || typeof price !== 'string') return null;
  const m = price.trim().match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const a = parseFloat(m[1]);
  const b = parseFloat(m[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

export class ProductQuery {
  static mergeEffectiveQuery(query: ProductQueryDto): EffectiveProductQuery {
    const attr: ProductQueryAttr = {};
    if (query.attr?.trim()) {
      Object.assign(attr, parseAttrQueryString(query.attr));
    }
    if (query.brands) {
      const b = splitCommaList(query.brands);
      if (b.length) attr.brand = [...new Set([...(attr.brand ?? []), ...b])];
    }
    if (query.sizes) {
      const s = splitCommaList(query.sizes);
      if (s.length) attr.size = [...new Set([...(attr.size ?? []), ...s])];
    }
    const { brands: _br, sizes: _sz, attr: _a, ...rest } = query;
    void _br;
    void _sz;
    void _a;
    return {
      ...rest,
      ...(Object.keys(attr).length ? { attr } : {}),
    };
  }

  /**
   * Storefront product list filters. Use `omit` when computing facet counts for one dimension.
   */
  static buildWhereClause(query: EffectiveProductQuery, options?: BuildWhereOptions): Record<string, unknown> {
    const omit = options?.omit ?? new Set<WhereOmit>();
    const and: Record<string, unknown>[] = [];

    const base: Record<string, unknown> = {
      deletedAt: null,
      status: 'active',
    };

    if (!omit.has('categories') && query.category) {
      const categoryIds = parseCategoryIds(query.category);
      if (categoryIds.length === 1) {
        and.push({
          categories: { some: { categoryId: categoryIds[0] } },
        });
      } else if (categoryIds.length > 1) {
        and.push({
          OR: categoryIds.map((id) => ({
            categories: { some: { categoryId: id } },
          })),
        });
      }
    }

    if (!omit.has('price')) {
      let minP = query.minPrice;
      let maxP = query.maxPrice;
      const range = parsePriceRangeString(query.price);
      if (range) {
        if (minP === undefined) minP = range.min;
        if (maxP === undefined) maxP = range.max;
      }
      if (minP !== undefined || maxP !== undefined) {
        const basePrice: Record<string, number> = {};
        if (minP !== undefined) basePrice.gte = minP;
        if (maxP !== undefined) basePrice.lte = maxP;
        and.push({ basePrice });
      }
    }

    const attr = query.attr;
    if (attr && Object.keys(attr).length > 0) {
      for (const [key, values] of Object.entries(attr)) {
        const vals = (Array.isArray(values) ? values : []).map((v) => String(v).trim()).filter(Boolean);
        if (vals.length === 0) continue;
        const omitKey = `attr:${key}` as WhereOmit;
        if (omit.has(omitKey)) continue;
        and.push({
          OR: vals.flatMap((v) => buildAttributeValueMatch(key, v)),
        });
      }
    }

    if (!omit.has('customAttributes') && query.attributes && Object.keys(query.attributes).length > 0) {
      for (const [key, value] of Object.entries(query.attributes)) {
        and.push({
          attributes: { path: [key], equals: value },
        });
      }
    }

    const searchTerm = typeof query.search === 'string' ? query.search.trim() : '';
    if (searchTerm.length >= 2) {
      and.push({
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { sku: { contains: searchTerm, mode: 'insensitive' } },
          { slug: { contains: searchTerm, mode: 'insensitive' } },
          {
            categories: {
              some: {
                category: {
                  name: { contains: searchTerm, mode: 'insensitive' },
                },
              },
            },
          },
        ],
      });
    }

    if (and.length > 0) {
      base.AND = and;
    }

    return base;
  }

  /** Admin catalog list: non-deleted only; optional status and filters */
  static buildAdminWhereClause(query: AdminProductListQueryDto | ProductQueryDto) {
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.categories = {
        some: {
          categoryId: query.category,
        },
      };
    }

    const hasPriceAndAttributesFilters = 'minPrice' in query || 'maxPrice' in query || 'attributes' in query;
    if (hasPriceAndAttributesFilters && (query.minPrice !== undefined || query.maxPrice !== undefined)) {
      const priceFilter: Record<string, number> = {};
      if (query.minPrice !== undefined) {
        priceFilter.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        priceFilter.lte = query.maxPrice;
      }
      where.basePrice = priceFilter;
    }

    if (hasPriceAndAttributesFilters && query.attributes && Object.keys(query.attributes).length > 0) {
      const attributeFilters = Object.entries(query.attributes).map(([key, value]) => ({
        attributes: {
          path: [key],
          equals: value,
        },
      }));

      if (attributeFilters.length === 1) {
        where.attributes = attributeFilters[0].attributes;
      } else if (attributeFilters.length > 1) {
        where.AND = attributeFilters.map((filter) => ({ attributes: filter.attributes }));
      }
    }
    const searchTerm = typeof query.search === 'string' ? query.search.trim() : '';
    if (searchTerm.length >= 2) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { slug: { contains: searchTerm, mode: 'insensitive' } },
        {
          categories: {
            some: {
              category: {
                name: { contains: searchTerm, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    return where;
  }

  static buildAdminListInclude(): {
    images: { take: number; orderBy: ({ isPrimary: 'desc' } | { position: 'asc' })[] };
    categories: {
      orderBy: { position: 'asc' };
      include: { category: { select: { id: true; name: true; slug: true } } };
    };
    _count: { select: { variants: true } };
  } {
    return {
      images: {
        take: 1,
        orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
      },
      categories: {
        orderBy: { position: 'asc' },
        include: { category: { select: { id: true, name: true, slug: true } } },
      },
      _count: {
        select: { variants: true },
      },
    };
  }

  /** Admin product detail / mutations: full variants, images, categories with nested category row. */
  static buildAdminProductDetailInclude(): {
    variants: {
      orderBy: { position: 'asc' };
      include: {
        optionValues: { include: { option: true; value: true } };
      };
    };
    images: { orderBy: ({ isPrimary: 'desc' } | { position: 'asc' })[] };
    categories: {
      orderBy: { position: 'asc' };
      include: { category: { select: { id: true; name: true; slug: true } } };
    };
    options: {
      orderBy: { position: 'asc' };
      include: {
        option: { include: { values: { orderBy: ({ sortOrder: 'asc' } | { value: 'asc' })[] } } };
        values: { include: { value: true } };
      };
    };
  } {
    return {
      variants: {
        orderBy: { position: 'asc' },
        include: {
          optionValues: { include: { option: true, value: true } },
        },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
      },
      categories: {
        orderBy: { position: 'asc' },
        include: { category: { select: { id: true, name: true, slug: true } } },
      },
      options: {
        orderBy: { position: 'asc' },
        include: {
          option: {
            include: {
              values: { orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }] },
            },
          },
          values: { include: { value: true } },
        },
      },
    };
  }
  static buildIncludeClause(): {
    variants: {
      where: { isActive: boolean };
      orderBy: { position: 'asc' };
      include: {
        optionValues: { include: { option: true; value: true } };
      };
    };
    images: { orderBy: ({ isPrimary: 'desc' } | { position: 'asc' })[] };
    categories: {
      orderBy: { position: 'asc' };
      include: { category: { select: { id: true; name: true; slug: true } } };
    };
    options: {
      orderBy: { position: 'asc' };
      include: {
        option: { include: { values: { orderBy: ({ sortOrder: 'asc' } | { value: 'asc' })[] } } };
        values: { include: { value: true } };
      };
    };
  } {
    return {
      variants: {
        where: { isActive: true },
        orderBy: { position: 'asc' },
        include: {
          optionValues: { include: { option: true, value: true } },
        },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
      },
      categories: {
        orderBy: { position: 'asc' },
        include: { category: { select: { id: true, name: true, slug: true } } },
      },
      options: {
        orderBy: { position: 'asc' },
        include: {
          option: {
            include: {
              values: { orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }] },
            },
          },
          values: { include: { value: true } },
        },
      },
    };
  }

  static buildPaginationParams(query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    return { skip, take: limit, page };
  }
}


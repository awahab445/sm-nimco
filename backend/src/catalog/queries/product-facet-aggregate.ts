import { Prisma } from '@prisma/client';
import { ProductQueryDto } from '../dto/product-query.dto';
import {
  ProductQuery,
  expandCategoryFilterWithDescendants,
  readAttributeValue,
  WhereOmit,
} from './product.query';
import { PrismaService } from '../services/prisma.service';

const FACET_SCAN_MAX = 8000;

export type FacetPanelCategory = {
  kind: 'category';
  code: string;
  name: string;
  categories: Array<{ id: string; name: string; slug: string; count: number }>;
};

export type FacetPanelPrice = {
  kind: 'price';
  code: string;
  name: string;
  priceRange: { min: number; max: number };
};

export type FacetPanelAttribute = {
  kind: 'attribute';
  code: string;
  name: string;
  options: Array<{ value: string; label: string; count: number }>;
};

export type ProductFacetsResponse = {
  matchingTotal: number;
  filterPanels: Array<
    FacetPanelCategory | FacetPanelPrice | FacetPanelAttribute
  >;
  countsApproximated?: boolean;
};

function toNumber(v: Prisma.Decimal | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function readAttrKey(attrs: unknown, key: string): string | null {
  return readAttributeValue(attrs, key);
}

const facetSelect = {
  attributes: true,
  variants: {
    where: { isActive: true },
    select: { attributes: true },
  },
  categories: {
    select: {
      categoryId: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  },
  basePrice: true,
} as const;

type FacetRow = Prisma.ProductGetPayload<{ select: typeof facetSelect }>;

export class ProductFacetAggregate {
  static async compute(
    prisma: PrismaService,
    query: ProductQueryDto,
  ): Promise<ProductFacetsResponse> {
    const merged = ProductQuery.mergeEffectiveQuery(query);
    const q = await expandCategoryFilterWithDescendants(prisma, merged);
    type LayoutRow = {
      id: string;
      code: string;
      name: string;
      kind: string;
      sortOrder: number;
      isActive: boolean;
      options: Array<{
        value: string;
        label: string | null;
        isActive: boolean;
        sortOrder: number;
      }>;
    };
    const layout = (await (prisma as any).storefrontFilter.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      include: {
        options: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }],
        },
      },
    })) as LayoutRow[];

    const fullWhere = ProductQuery.buildWhereClause(q);
    const matchingTotal = await prisma.product.count({ where: fullWhere });

    const whereNoPrice = ProductQuery.buildWhereClause(q, {
      omit: new Set<WhereOmit>(['price']),
    });
    const agg = await prisma.product.aggregate({
      where: whereNoPrice,
      _min: { basePrice: true },
      _max: { basePrice: true },
    });
    const priceMin = toNumber(agg._min.basePrice) ?? 0;
    const priceMax = toNumber(agg._max.basePrice) ?? 0;

    async function scan(omit: WhereOmit): Promise<FacetRow[] | null> {
      const where = ProductQuery.buildWhereClause(q, {
        omit: new Set<WhereOmit>([omit]),
      });
      const c = await prisma.product.count({ where });
      if (c > FACET_SCAN_MAX) return null;
      return prisma.product.findMany({ where, select: facetSelect });
    }

    const scanResults = await Promise.all([
      scan('categories'),
      ...layout
        .filter((f) => f.kind === 'ATTRIBUTE')
        .map((f) => scan(`attr:${f.code}` as WhereOmit)),
    ]);
    const catRows = scanResults[0];
    const attrScans = scanResults.slice(1);

    const countsApproximated =
      catRows === null || attrScans.some((r) => r === null);

    const categoryMap = new Map<
      string,
      { name: string; slug: string; count: number }
    >();
    if (catRows) {
      for (const row of catRows) {
        for (const pc of row.categories) {
          const id = pc.category.id;
          const prev = categoryMap.get(id);
          if (prev) prev.count += 1;
          else
            categoryMap.set(id, {
              name: pc.category.name,
              slug: pc.category.slug,
              count: 1,
            });
        }
      }
    }

    const attrLayouts = layout.filter((f) => f.kind === 'ATTRIBUTE');
    const attrMaps = new Map<
      string,
      Map<string, { label: string; count: number }>
    >();
    attrLayouts.forEach((f, i) => {
      const rows = attrScans[i];
      const m = new Map<string, { label: string; count: number }>();
      if (rows) {
        for (const row of rows) {
          const seen = new Set<string>();
          const bump = (v: string | null) => {
            if (!v || seen.has(v)) return;
            seen.add(v);
            const prev = m.get(v);
            if (prev) prev.count += 1;
            else m.set(v, { label: v, count: 1 });
          };
          bump(readAttrKey(row.attributes, f.code));
          for (const variant of row.variants) {
            bump(readAttrKey(variant.attributes, f.code));
          }
        }
      }
      attrMaps.set(f.code, m);
    });

    const filterPanels: ProductFacetsResponse['filterPanels'] = [];

    for (const f of layout) {
      if (f.kind === 'CATEGORY') {
        const categories = Array.from(categoryMap.entries())
          .map(([id, v]) => ({
            id,
            name: v.name,
            slug: v.slug,
            count: v.count,
          }))
          .sort((a, b) => b.count - a.count);
        filterPanels.push({
          kind: 'category',
          code: f.code,
          name: f.name,
          categories,
        });
      } else if (f.kind === 'PRICE') {
        filterPanels.push({
          kind: 'price',
          code: f.code,
          name: f.name,
          priceRange: { min: priceMin, max: Math.max(priceMin, priceMax) },
        });
      } else if (f.kind === 'ATTRIBUTE') {
        const fromProducts = attrMaps.get(f.code) ?? new Map();
        const activeOptions = f.options.filter((o) => o.isActive);
        let options: Array<{ value: string; label: string; count: number }>;
        if (activeOptions.length > 0) {
          options = activeOptions.map((o) => {
            const hit = fromProducts.get(o.value);
            return {
              value: o.value,
              label: (o.label && o.label.trim()) || o.value,
              count: hit?.count ?? 0,
            };
          });
        } else {
          options = Array.from(fromProducts.entries())
            .map(([value, v]) => ({ value, label: v.label, count: v.count }))
            .sort((a, b) =>
              f.code === 'brand'
                ? b.count - a.count
                : a.label.localeCompare(b.label, undefined, {
                    sensitivity: 'base',
                  }),
            );
        }
        filterPanels.push({
          kind: 'attribute',
          code: f.code,
          name: f.name,
          options,
        });
      }
    }

    return {
      matchingTotal,
      filterPanels,
      ...(countsApproximated ? { countsApproximated: true } : {}),
    };
  }
}

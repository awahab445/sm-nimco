import { ProductQueryDto } from '../dto/product-query.dto';
import { AdminProductListQueryDto } from '../dto/admin-product-list-query.dto';

export class ProductQuery {
  static buildWhereClause(query: ProductQueryDto) {
    const where: any = {
      deletedAt: null,
      status: 'active',
    };

    if (query.category) {
      where.categories = {
        some: {
          categoryId: query.category,
        },
      };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {};
      if (query.minPrice !== undefined) {
        where.basePrice.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.basePrice.lte = query.maxPrice;
      }
    }

    if (query.attributes && Object.keys(query.attributes).length > 0) {
      // JSONB attribute filtering - checks if attributes contain the specified values
      // For complex queries, consider using raw SQL or a more sophisticated approach
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

    // Search: product name, sku, slug, or category name (trimmed; min 2 chars to avoid heavy scans)
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
    variants: { orderBy: { position: 'asc' } };
    images: { orderBy: ({ isPrimary: 'desc' } | { position: 'asc' })[] };
    categories: {
      orderBy: { position: 'asc' };
      include: { category: { select: { id: true; name: true; slug: true } } };
    };
  } {
    return {
      variants: {
        orderBy: { position: 'asc' },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
      },
      categories: {
        orderBy: { position: 'asc' },
        include: { category: { select: { id: true, name: true, slug: true } } },
      },
    };
  }
  static buildIncludeClause(): {
    variants: { where: { isActive: boolean }; orderBy: { position: 'asc' } };
    images: { orderBy: ({ isPrimary: 'desc' } | { position: 'asc' })[] };
    categories: {
      orderBy: { position: 'asc' };
      include: { category: { select: { id: true; name: true; slug: true } } };
    };
  } {
    return {
      variants: {
        where: { isActive: true },
        orderBy: { position: 'asc' },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
      },
      categories: {
        orderBy: { position: 'asc' },
        include: { category: { select: { id: true, name: true, slug: true } } },
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


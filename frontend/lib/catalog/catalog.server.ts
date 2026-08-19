import { SERVER_API_BASE_URL } from '@/lib/api-base-url';
import type {
  Category,
  CategoryTreeItem,
  Product,
  ProductListQuery,
  ProductListResponse,
} from '@/lib/api-client';
import { CACHE_TAGS } from '@/lib/cache-tags';

async function fetchJson<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API_BASE_URL}${path}`, {
      next: { revalidate, tags: [CACHE_TAGS.catalog, CACHE_TAGS.storefront] },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const clean = slug.trim();
  if (!clean) return null;
  return fetchJson<Product>(`/products/${encodeURIComponent(clean)}`);
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const clean = slug.trim();
  if (!clean) return null;
  return fetchJson<Category>(`/categories/slug/${encodeURIComponent(clean)}`);
}

export async function fetchProductList(
  query: ProductListQuery = {},
): Promise<ProductListResponse | null> {
  const params = new URLSearchParams();
  if (query.category != null) params.set('category', query.category);
  if (query.minPrice != null) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice != null) params.set('maxPrice', String(query.maxPrice));
  if (query.price != null) params.set('price', query.price);
  if (query.attr != null && query.attr !== '') params.set('attr', query.attr);
  if (query.brands != null && query.brands !== '') params.set('brands', query.brands);
  if (query.sizes != null && query.sizes !== '') params.set('sizes', query.sizes);
  if (query.search != null) params.set('search', query.search);
  if (query.page != null) params.set('page', String(query.page));
  if (query.limit != null) params.set('limit', String(query.limit));
  if (query.attributes != null) params.set('attributes', JSON.stringify(query.attributes));
  const qs = params.toString();
  return fetchJson<ProductListResponse>(`/products${qs ? `?${qs}` : ''}`);
}

export async function fetchInventoryAvailability(
  variantIds: string[],
): Promise<Record<string, number>> {
  if (variantIds.length === 0) return {};
  const qs = new URLSearchParams({ variantIds: variantIds.join(',') }).toString();
  const res = await fetchJson<{ data: Record<string, number> }>(
    `/inventory/availability?${qs}`,
  );
  return res?.data ?? {};
}

export async function fetchFeaturedCategories(): Promise<Category[]> {
  const res = await fetchJson<{ data: Category[] }>('/categories?featured=true');
  if (!res?.data) return [];
  return [...res.data].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export async function fetchCategoryTree(): Promise<CategoryTreeItem[]> {
  const res = await fetchJson<CategoryTreeItem[] | { data: CategoryTreeItem[] }>(
    '/categories?tree=true',
  );
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

export async function fetchAllProductSlugs(maxPages = 50): Promise<
  Array<{ slug: string; updatedAt?: string }>
> {
  const items: Array<{ slug: string; updatedAt?: string }> = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= maxPages) {
    const res = await fetchJson<ProductListResponse>(
      `/products?page=${page}&limit=100`,
      300,
    );
    if (!res?.data?.length) break;
    for (const product of res.data) {
      if (product.slug) {
        items.push({ slug: product.slug, updatedAt: product.updatedAt });
      }
    }
    totalPages = res.meta?.totalPages ?? page;
    page += 1;
  }

  return items;
}

export async function fetchAllCategories(): Promise<Category[]> {
  const res = await fetchJson<{ data: Category[] } | Category[]>('/categories', 300);
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

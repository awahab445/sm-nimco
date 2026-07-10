import { SERVER_API_BASE_URL } from '@/lib/api-base-url';
import type { Category, Product, ProductListResponse } from '@/lib/api-client';
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

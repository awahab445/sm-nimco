import { SERVER_API_BASE_URL } from '@/lib/api-base-url';
import { CACHE_TAGS } from '@/lib/cache-tags';

export type StorefrontBundleDealItem = {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitListPrice: number | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    images?: { url: string }[];
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    attributes?: Record<string, unknown> | null;
    optionValues?: {
      option: { id: string; name: string; code: string };
      value: { id: string; value: string; code: string | null };
    }[];
    variantAttributes?: string[];
  } | null;
};

export type StorefrontBundleDeal = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  isFeatured: boolean;
  dealPrice: number;
  compareAtTotal: number;
  savingsAmount: number;
  savingsPercent: number | null;
  imageUrl: string | null;
  itemCount?: number;
  items?: StorefrontBundleDealItem[];
};

const DEALS_FETCH_CACHE: RequestInit = {
  next: {
    revalidate: 60,
    tags: [CACHE_TAGS.deals, CACHE_TAGS.storefront],
  },
};

export async function fetchBundleDeals(): Promise<StorefrontBundleDeal[]> {
  try {
    const res = await fetch(`${SERVER_API_BASE_URL}/deals`, DEALS_FETCH_CACHE);
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: StorefrontBundleDeal[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchBundleDealBySlug(slug: string): Promise<StorefrontBundleDeal | null> {
  try {
    const res = await fetch(
      `${SERVER_API_BASE_URL}/deals/${encodeURIComponent(slug)}`,
      DEALS_FETCH_CACHE,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: StorefrontBundleDeal };
    return json.data ?? null;
  } catch {
    return null;
  }
}

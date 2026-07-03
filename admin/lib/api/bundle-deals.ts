import { fetchApi } from '../api-client';
import { getToken } from '../auth-token';

export type BundleDealStatus = 'draft' | 'active' | 'disabled';

export type BundleDealItem = {
  id: string;
  bundleDealId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  position: number;
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
  } | null;
};

export type BundleDeal = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: BundleDealStatus;
  isFeatured: boolean;
  dealPrice: number;
  compareAtTotal: number;
  savingsAmount: number;
  savingsPercent: number | null;
  imageUrl: string | null;
  validFrom: string | null;
  validTo: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
  items?: BundleDealItem[];
};

export type BundleDealItemInput = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type CreateBundleDealBody = {
  title: string;
  slug?: string;
  description?: string;
  status?: BundleDealStatus;
  isFeatured?: boolean;
  dealPrice: number;
  imageUrl?: string;
  validFrom?: string;
  validTo?: string;
  items: BundleDealItemInput[];
};

export type UpdateBundleDealBody = Partial<CreateBundleDealBody> & {
  imageUrl?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
};

export type BundlePricingPreview = {
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    unitListPrice: number;
    lineListTotal: number;
    productName?: string;
    variantName?: string;
    productImage?: string;
    sku?: string;
  }>;
  compareAtTotal: number;
  dealPrice: number;
  savingsAmount: number;
  savingsPercent: number;
};

export async function fetchBundleDeals(params?: {
  q?: string;
  status?: BundleDealStatus;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.q?.trim()) sp.set('q', params.q.trim());
  if (params?.status) sp.set('status', params.status);
  if (params?.featured) sp.set('featured', 'true');
  if (params?.page) sp.set('page', String(params.page));
  if (params?.limit) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return fetchApi<{ data: BundleDeal[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
    `/admin/deals${q ? `?${q}` : ''}`,
  );
}

export async function fetchBundleDeal(id: string): Promise<BundleDeal> {
  return fetchApi<BundleDeal>(`/admin/deals/${id}`);
}

export async function createBundleDeal(body: CreateBundleDealBody): Promise<BundleDeal> {
  return fetchApi<BundleDeal>('/admin/deals', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateBundleDeal(id: string, body: UpdateBundleDealBody): Promise<BundleDeal> {
  return fetchApi<BundleDeal>(`/admin/deals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteBundleDeal(id: string): Promise<void> {
  return fetchApi<void>(`/admin/deals/${id}`, { method: 'DELETE' });
}

export async function previewBundlePricing(body: {
  items: BundleDealItemInput[];
  dealPrice?: number;
}): Promise<BundlePricingPreview> {
  return fetchApi<BundlePricingPreview>('/admin/deals/preview-pricing', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function uploadBundleDealImage(file: File): Promise<{ url: string; filename: string }> {
  const form = new FormData();
  form.append('file', file);
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const res = await fetch(`${base}/admin/deals/images/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Upload failed');
  }
  return res.json();
}

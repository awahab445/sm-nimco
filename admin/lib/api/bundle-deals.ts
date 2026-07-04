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

function toBundleDealFormData(
  body: CreateBundleDealBody | UpdateBundleDealBody,
  imageFile?: File | null,
): FormData {
  const form = new FormData();

  if (body.title !== undefined) form.set('title', body.title);
  if (body.slug !== undefined) form.set('slug', body.slug);
  if (body.description !== undefined) form.set('description', body.description);
  if (body.status !== undefined) form.set('status', body.status);
  if (body.isFeatured !== undefined) form.set('isFeatured', String(body.isFeatured));
  if (body.dealPrice !== undefined) form.set('dealPrice', String(body.dealPrice));
  if (body.imageUrl !== undefined) {
    form.set('imageUrl', body.imageUrl ?? '');
  }
  if (body.validFrom !== undefined) {
    form.set('validFrom', body.validFrom ?? '');
  }
  if (body.validTo !== undefined) {
    form.set('validTo', body.validTo ?? '');
  }
  if (body.items !== undefined) {
    form.set('items', JSON.stringify(body.items));
  }
  if (imageFile) {
    form.set('image', imageFile);
  }

  return form;
}

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

export async function createBundleDeal(
  body: CreateBundleDealBody,
  imageFile?: File | null,
): Promise<BundleDeal> {
  if (imageFile) {
    return fetchApi<BundleDeal>('/admin/deals', {
      method: 'POST',
      body: toBundleDealFormData(body, imageFile),
    });
  }
  return fetchApi<BundleDeal>('/admin/deals', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateBundleDeal(
  id: string,
  body: UpdateBundleDealBody,
  imageFile?: File | null,
): Promise<BundleDeal> {
  if (imageFile) {
    return fetchApi<BundleDeal>(`/admin/deals/${id}`, {
      method: 'PATCH',
      body: toBundleDealFormData(body, imageFile),
    });
  }
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

/** Standalone hero image upload (legacy); prefer passing imageFile to create/update. */
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
    let message = `Image upload failed (${res.status})`;
    try {
      const err = (await res.json()) as { message?: string };
      if (err?.message) message = err.message;
    } catch {
      // Keep fallback message when response is not JSON.
    }
    throw new Error(message);
  }
  return res.json();
}

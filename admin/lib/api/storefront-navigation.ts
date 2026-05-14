import { fetchApi } from '../api-client';
import { getToken } from '../auth-token';

export type StorefrontNavZone = 'header' | 'mega';

export type StorefrontNavRow = {
  id: string;
  label: string;
  secondaryLabel: string | null;
  href: string;
  sortOrder: number;
  isActive: boolean;
  kind: string;
  zone: StorefrontNavZone;
  parentId: string | null;
  categoryId: string | null;
  openMegaMenu: boolean;
  bannerImageUrl: string | null;
  bannerHref: string | null;
  bannerAlt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug: string } | null;
};

export async function fetchStorefrontNavigation(): Promise<StorefrontNavRow[]> {
  const res = await fetchApi<{ data: StorefrontNavRow[] }>('/admin/storefront-navigation');
  return res.data;
}

export type CreateStorefrontNavBody = {
  label: string;
  secondaryLabel?: string | null;
  href?: string;
  sortOrder?: number;
  isActive?: boolean;
  kind?: string;
  zone?: StorefrontNavZone;
  parentId?: string | null;
  categoryId?: string | null;
  openMegaMenu?: boolean;
  bannerImageUrl?: string | null;
  bannerHref?: string | null;
  bannerAlt?: string | null;
};

export async function createStorefrontNavItem(body: CreateStorefrontNavBody): Promise<StorefrontNavRow> {
  return fetchApi<StorefrontNavRow>('/admin/storefront-navigation', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateStorefrontNavBody = Partial<CreateStorefrontNavBody>;

export async function updateStorefrontNavItem(
  id: string,
  body: UpdateStorefrontNavBody,
): Promise<StorefrontNavRow> {
  return fetchApi<StorefrontNavRow>(`/admin/storefront-navigation/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteStorefrontNavItem(id: string): Promise<void> {
  await fetchApi<unknown>(`/admin/storefront-navigation/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export type ReorderStorefrontNavBody = {
  items: Array<{
    id: string;
    parentId: string | null;
    sortOrder: number;
    zone: StorefrontNavZone;
  }>;
};

export async function reorderStorefrontNavigation(body: ReorderStorefrontNavBody): Promise<void> {
  await fetchApi('/admin/storefront-navigation/reorder', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function uploadStorefrontNavBannerImage(
  file: File,
): Promise<{ url: string; filename: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const formData = new FormData();
  formData.append('file', file);
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${baseUrl}/admin/storefront-navigation/banner/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers,
  });
  if (!response.ok) {
    let message = `Upload failed (${response.status})`;
    try {
      const errorData = (await response.json()) as { message?: string };
      if (errorData?.message) message = errorData.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return response.json() as Promise<{ url: string; filename: string }>;
}

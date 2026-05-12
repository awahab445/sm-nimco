import { fetchApi } from '../api-client';

export type StorefrontNavKind = 'LINK' | 'MEGA_CATEGORIES';

export type StorefrontNavRow = {
  id: string;
  label: string;
  secondaryLabel: string | null;
  href: string;
  sortOrder: number;
  isActive: boolean;
  kind: StorefrontNavKind;
  createdAt: string;
  updatedAt: string;
};

export async function fetchStorefrontNavigation(): Promise<StorefrontNavRow[]> {
  const res = await fetchApi<{ data: StorefrontNavRow[] }>('/admin/storefront-navigation');
  return res.data;
}

export type CreateStorefrontNavBody = {
  label: string;
  secondaryLabel?: string | null;
  href: string;
  sortOrder?: number;
  isActive?: boolean;
  kind: StorefrontNavKind;
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

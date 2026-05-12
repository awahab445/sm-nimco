import { fetchApi } from '../api-client';

export type StorefrontFilterKind = 'CATEGORY' | 'PRICE' | 'ATTRIBUTE';

export type StorefrontFilterRow = {
  id: string;
  code: string;
  name: string;
  kind: StorefrontFilterKind;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  options: StorefrontFilterOptionRow[];
};

export type StorefrontFilterOptionRow = {
  id: string;
  filterId: string;
  value: string;
  label: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchStoreFilters(): Promise<StorefrontFilterRow[]> {
  const res = await fetchApi<{ data: StorefrontFilterRow[] }>('/admin/store-filters');
  return res.data;
}

export type CreateStoreFilterBody = {
  code: string;
  name: string;
  kind: StorefrontFilterKind;
  sortOrder?: number;
  isActive?: boolean;
};

export async function createStoreFilter(body: CreateStoreFilterBody): Promise<StorefrontFilterRow> {
  return fetchApi<StorefrontFilterRow>('/admin/store-filters', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateStoreFilterBody = {
  code?: string;
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function updateStoreFilter(id: string, body: UpdateStoreFilterBody): Promise<StorefrontFilterRow> {
  return fetchApi<StorefrontFilterRow>(`/admin/store-filters/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteStoreFilter(id: string): Promise<void> {
  await fetchApi<unknown>(`/admin/store-filters/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export type CreateStoreFilterOptionBody = {
  value: string;
  label?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function createStoreFilterOption(
  filterId: string,
  body: CreateStoreFilterOptionBody,
): Promise<StorefrontFilterOptionRow> {
  return fetchApi<StorefrontFilterOptionRow>(`/admin/store-filters/${encodeURIComponent(filterId)}/options`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateStoreFilterOptionBody = {
  value?: string;
  label?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function updateStoreFilterOption(
  optionId: string,
  body: UpdateStoreFilterOptionBody,
): Promise<StorefrontFilterOptionRow> {
  return fetchApi<StorefrontFilterOptionRow>(`/admin/store-filters/options/${encodeURIComponent(optionId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteStoreFilterOption(optionId: string): Promise<void> {
  await fetchApi<unknown>(`/admin/store-filters/options/${encodeURIComponent(optionId)}`, { method: 'DELETE' });
}

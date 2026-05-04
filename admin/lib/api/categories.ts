import { fetchApi } from '../api-client';

export type AdminCategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  position: number;
  isActive: boolean;
  productCount: number;
};

export type CategoryDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchAdminCategories(): Promise<AdminCategoryListItem[]> {
  const res = await fetchApi<{ data: AdminCategoryListItem[] }>('/admin/categories');
  return res.data;
}

export async function fetchAdminCategory(id: string): Promise<CategoryDetail> {
  return fetchApi<CategoryDetail>(`/admin/categories/${id}`);
}

export type CreateCategoryBody = {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  position?: number;
};

export async function createAdminCategory(
  body: CreateCategoryBody,
): Promise<CategoryDetail> {
  return fetchApi<CategoryDetail>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateCategoryBody = {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  position?: number;
  isActive?: boolean;
};

export async function updateAdminCategory(
  id: string,
  body: UpdateCategoryBody,
): Promise<CategoryDetail> {
  return fetchApi<CategoryDetail>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteAdminCategory(id: string): Promise<CategoryDetail | void> {
  return fetchApi<CategoryDetail | void>(`/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

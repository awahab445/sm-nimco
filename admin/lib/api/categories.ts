import { fetchApi } from '../api-client';
import { getToken } from '../auth-token';

export type AdminCategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  parentId: string | null;
  position: number;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
};

export type CategoryDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  parentId: string | null;
  position: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryMappedProduct = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  status: string;
  position: number;
};

export async function fetchAdminCategories(): Promise<AdminCategoryListItem[]> {
  const res = await fetchApi<{ data: AdminCategoryListItem[] }>('/admin/categories');
  return res.data;
}

export async function fetchAdminCategory(id: string): Promise<CategoryDetail> {
  return fetchApi<CategoryDetail>(`/admin/categories/${id}`);
}

export async function fetchCategoryProducts(
  categoryId: string,
): Promise<CategoryMappedProduct[]> {
  const res = await fetchApi<{ data: CategoryMappedProduct[] }>(
    `/admin/categories/${categoryId}/products`,
  );
  return res.data;
}

export type CreateCategoryBody = {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  parentId?: string;
  position?: number;
  isFeatured?: boolean;
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
  imageUrl?: string | null;
  bannerUrl?: string | null;
  parentId?: string | null;
  position?: number;
  isActive?: boolean;
  isFeatured?: boolean;
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

export async function syncCategoryProducts(
  categoryId: string,
  productIds: string[],
): Promise<{ data: CategoryMappedProduct[] }> {
  return fetchApi<{ data: CategoryMappedProduct[] }>(
    `/admin/categories/${categoryId}/products`,
    {
      method: 'PUT',
      body: JSON.stringify({ productIds }),
    },
  );
}

export async function deleteAdminCategory(id: string): Promise<CategoryDetail | void> {
  return fetchApi<CategoryDetail | void>(`/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadCategoryImage(
  file: File,
): Promise<{ url: string; filename: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const formData = new FormData();
  formData.append('file', file);
  const headers = new Headers();
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${baseUrl}/admin/categories/images/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers,
  });
  if (!response.ok) {
    let message = `Image upload failed (${response.status})`;
    try {
      const errorData = (await response.json()) as { message?: string };
      if (errorData?.message) {
        message = errorData.message;
      }
    } catch {
      // Keep fallback message when response is not JSON.
    }
    throw new Error(message);
  }
  return response.json() as Promise<{ url: string; filename: string }>;
}

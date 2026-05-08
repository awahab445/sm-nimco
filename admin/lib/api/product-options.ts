import { fetchApi } from '../api-client';

export type ProductOptionValue = {
  id: string;
  optionId: string;
  value: string;
  code?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductOption = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  values: ProductOptionValue[];
};

export async function fetchProductOptionsCatalog(): Promise<ProductOption[]> {
  return fetchApi<ProductOption[]>('/admin/product-options');
}

export async function createProductOption(body: {
  name: string;
  code: string;
  isActive?: boolean;
}): Promise<ProductOption> {
  return fetchApi<ProductOption>('/admin/product-options', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateProductOption(
  id: string,
  body: Partial<{ name: string; code: string; isActive: boolean }>,
): Promise<ProductOption> {
  return fetchApi<ProductOption>(`/admin/product-options/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteProductOption(id: string): Promise<{ message: string }> {
  return fetchApi<{ message: string }>(`/admin/product-options/${id}`, { method: 'DELETE' });
}

export async function createProductOptionValue(
  optionId: string,
  body: { value: string; code?: string; sortOrder?: number; isActive?: boolean },
): Promise<ProductOptionValue> {
  return fetchApi<ProductOptionValue>(`/admin/product-options/${optionId}/values`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateProductOptionValue(
  id: string,
  body: Partial<{ value: string; code: string | null; sortOrder: number; isActive: boolean }>,
): Promise<ProductOptionValue> {
  return fetchApi<ProductOptionValue>(`/admin/product-option-values/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteProductOptionValue(id: string): Promise<{ message: string }> {
  return fetchApi<{ message: string }>(`/admin/product-option-values/${id}`, {
    method: 'DELETE',
  });
}


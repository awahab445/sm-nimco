import { fetchApi } from '../api-client';

export type ProductType = 'simple' | 'configurable' | 'bundle' | 'virtual';
export type ProductStatus = 'draft' | 'active' | 'disabled';
export type ProductVisibility = 'catalog' | 'search' | 'both' | 'none';

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: string | number;
  cost?: string | number | null;
  weight?: string | number | null;
  attributes: Record<string, unknown>;
  position: number;
  isActive: boolean;
};

export type ProductImage = {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  position: number;
  isPrimary: boolean;
};

export type ProductCategoryLink = {
  productId: string;
  categoryId: string;
  position: number;
  category: { id: string; name: string; slug: string };
};

export type ProductDetail = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: string | number;
  cost: string | number | null;
  weight: string | number | null;
  status: string;
  visibility: string;
  taxClassId: string | null;
  attributes: Record<string, unknown>;
  metaData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  variants: ProductVariant[];
  images: ProductImage[];
  categories: ProductCategoryLink[];
};

export type AdminProductListRow = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  type: string;
  basePrice: string | number;
  status: string;
  visibility: string;
  images: {
    id: string;
    url: string;
    altText?: string | null;
    isPrimary: boolean;
  }[];
  categories: ProductCategoryLink[];
  _count: { variants: number };
};

export async function fetchAdminProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  category?: string;
}) {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.search?.trim()) sp.set('search', params.search.trim());
  if (params.status) sp.set('status', params.status);
  if (params.category) sp.set('category', params.category);
  const q = sp.toString();
  return fetchApi<{
    data: AdminProductListRow[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/admin/products${q ? `?${q}` : ''}`);
}

export async function fetchAdminProduct(id: string): Promise<ProductDetail> {
  return fetchApi<ProductDetail>(`/admin/products/${id}`);
}

export type CreateProductBody = {
  sku: string;
  name: string;
  slug?: string;
  type: ProductType;
  description?: string;
  shortDescription?: string;
  basePrice: number;
  cost?: number;
  weight?: number;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  taxClassId?: string;
  attributes?: Record<string, unknown>;
  metaData?: Record<string, unknown>;
};

export async function createAdminProduct(body: CreateProductBody) {
  return fetchApi<ProductDetail>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateProductBody = Partial<CreateProductBody>;

export async function updateAdminProduct(id: string, body: UpdateProductBody) {
  return fetchApi<ProductDetail>(`/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteAdminProduct(id: string) {
  return fetchApi<unknown>(`/admin/products/${id}`, { method: 'DELETE' });
}

export type CreateVariantBody = {
  sku: string;
  name: string;
  price: number;
  cost?: number;
  weight?: number;
  attributes?: Record<string, unknown>;
  position?: number;
  isActive?: boolean;
};

export async function createVariant(productId: string, body: CreateVariantBody) {
  return fetchApi(`/admin/products/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateVariant(variantId: string, body: Partial<CreateVariantBody>) {
  return fetchApi(`/admin/products/variants/${variantId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteVariant(variantId: string) {
  return fetchApi(`/admin/products/variants/${variantId}`, { method: 'DELETE' });
}

export type CreateImageBody = {
  url: string;
  altText?: string;
  position?: number;
  isPrimary?: boolean;
  variantId?: string;
};

export async function createProductImage(productId: string, body: CreateImageBody) {
  return fetchApi(`/admin/products/${productId}/images`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateProductImage(imageId: string, body: Partial<CreateImageBody>) {
  return fetchApi(`/admin/products/images/${imageId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteProductImage(imageId: string) {
  return fetchApi(`/admin/products/images/${imageId}`, { method: 'DELETE' });
}

export async function assignProductCategory(
  productId: string,
  categoryId: string,
  position?: number,
) {
  return fetchApi(`/admin/products/${productId}/categories`, {
    method: 'POST',
    body: JSON.stringify({ categoryId, ...(position !== undefined ? { position } : {}) }),
  });
}

export async function removeProductCategory(productId: string, categoryId: string) {
  return fetchApi(`/admin/products/${productId}/categories/${categoryId}`, {
    method: 'DELETE',
  });
}

export function moneyToNumber(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

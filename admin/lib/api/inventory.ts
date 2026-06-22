import { fetchApi, ApiError } from '../api-client';
import { getToken } from '../auth-token';

export const DEFAULT_WAREHOUSE_ID = 'default-warehouse';

export type InventoryStatusData = {
  variantId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isInStock: boolean;
};

export type InventoryStatusResponse = {
  success: boolean;
  data: InventoryStatusData;
};

export async function fetchInventoryStatus(variantId: string, warehouseId?: string) {
  const sp = new URLSearchParams({ variantId: variantId.trim() });
  const wh = warehouseId?.trim();
  if (wh) sp.set('warehouseId', wh);
  return fetchApi<InventoryStatusResponse>(`/admin/inventory/status?${sp.toString()}`);
}

export type AdjustStockBody = {
  variantId: string;
  quantity: number;
  reason?: string;
  warehouseId?: string;
};

export type AdjustStockResponse = {
  success: boolean;
  data: {
    inventoryItemId: string;
    variantId: string;
    warehouseId: string;
    previousQuantity: number;
    newQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
  };
};

export async function adjustInventoryStock(body: AdjustStockBody) {
  return fetchApi<AdjustStockResponse>('/admin/inventory/adjust', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type ProductInventoryMatrixResponse = {
  success: boolean;
  data: {
    productId: string;
    productName: string;
    productType: string;
    warehouseId: string;
    rows: Array<{
      targetId: string;
      type: 'product' | 'variant';
      sku: string;
      name: string;
      isActive: boolean;
      quantity: number;
      reservedQuantity: number;
      availableQuantity: number;
      lowStockThreshold: number;
    }>;
  };
};

export async function fetchProductInventoryMatrix(productId: string, warehouseId?: string) {
  const sp = new URLSearchParams({ productId: productId.trim() });
  const wh = warehouseId?.trim();
  if (wh) sp.set('warehouseId', wh);
  return fetchApi<ProductInventoryMatrixResponse>(`/admin/inventory/product-matrix?${sp.toString()}`);
}

export type SetProductInventoryQuantitiesResponse = {
  success: boolean;
  data: {
    productId: string;
    warehouseId: string;
    updated: Array<{
      targetId: string;
      previousQuantity: number;
      newQuantity: number;
      availableQuantity: number;
      reservedQuantity: number;
    }>;
  };
};

export async function setProductInventoryQuantities(
  productId: string,
  body: { warehouseId?: string; items: Array<{ targetId: string; quantity: number }> },
) {
  const sp = new URLSearchParams({ productId: productId.trim() });
  return fetchApi<SetProductInventoryQuantitiesResponse>(
    `/admin/inventory/set-product-quantities?${sp.toString()}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export type BulkAdjustStockItem = {
  variantId: string;
  quantity: number;
  reason?: string;
};

export type BulkAdjustStockResponse = {
  success: boolean;
  data: {
    warehouseId: string;
    updated: Array<{
      variantId: string;
      previousQuantity: number;
      newQuantity: number;
      availableQuantity: number;
      reservedQuantity: number;
      reason?: string;
    }>;
  };
};

export async function bulkAdjustInventoryStock(body: {
  warehouseId?: string;
  defaultReason?: string;
  items: BulkAdjustStockItem[];
}) {
  return fetchApi<BulkAdjustStockResponse>('/admin/inventory/bulk-adjust', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type BulkImportStockResponse = {
  success: boolean;
  data: {
    warehouseId: string;
    importedRows: number;
    updated: BulkAdjustStockResponse['data']['updated'];
  };
};

export async function bulkImportInventoryStock(file: File, warehouseId?: string, defaultReason?: string) {
  const formData = new FormData();
  formData.append('file', file);
  const sp = new URLSearchParams();
  const wh = warehouseId?.trim();
  if (wh) sp.set('warehouseId', wh);
  if (defaultReason?.trim()) sp.set('defaultReason', defaultReason.trim());
  const qs = sp.toString();
  const path = `/admin/inventory/bulk-import${qs ? `?${qs}` : ''}`;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      (errorData as { message?: string })?.message || `Request failed: ${response.statusText}`,
      response.status,
      errorData,
    );
  }

  return response.json() as Promise<BulkImportStockResponse>;
}

export const INVENTORY_IMPORT_TEMPLATE_CSV = `variant_id,quantity_delta,reason
00000000-0000-0000-0000-000000000001,10,Received shipment
00000000-0000-0000-0000-000000000002,-2,Cycle count correction
`;

export function downloadInventoryImportTemplate() {
  const blob = new Blob([INVENTORY_IMPORT_TEMPLATE_CSV], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'inventory-import-template.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

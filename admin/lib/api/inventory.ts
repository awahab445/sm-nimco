import { fetchApi } from '../api-client';

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

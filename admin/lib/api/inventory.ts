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

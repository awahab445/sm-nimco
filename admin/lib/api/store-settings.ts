import { fetchApi } from '@/lib/api-client';

export type StoreOrderSettings = {
  id: string;
  minimumOrderAmount: number;
  freeDeliveryThreshold: number;
  shippingGstPercentage: number;
  updatedAt: string;
  updatedByAdminUserId: string | null;
};

export type StoreOrderSettingsInput = {
  minimumOrderAmount?: number;
  freeDeliveryThreshold?: number;
  shippingGstPercentage?: number;
};

export async function fetchStoreOrderSettings(): Promise<StoreOrderSettings> {
  const res = await fetchApi<{ data: StoreOrderSettings }>('/admin/settings/store');
  return res.data;
}

export async function updateStoreOrderSettings(
  input: StoreOrderSettingsInput,
): Promise<StoreOrderSettings> {
  const res = await fetchApi<{ data: StoreOrderSettings }>('/admin/settings/store', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return res.data;
}

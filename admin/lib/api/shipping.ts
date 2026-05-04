import { fetchApi } from '../api-client';

export type ZoneCoverage = {
  countries?: string[];
  regions?: string[];
  cities?: string[];
};

export type ShippingZone = {
  id: string;
  name: string;
  description: string | null;
  coverage: ZoneCoverage;
  priority: number;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ShippingMethodType = 'flat_rate' | 'weight_based' | 'amount_based' | 'courier_api';

export type ShippingMethodConfig = Record<string, unknown>;

export type ShippingMethodCustomerGroup = {
  id: string;
  shippingMethodId: string;
  customerGroupId: string;
  discountPercent: number | null;
  fixedCost: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ShippingMethod = {
  id: string;
  zoneId: string;
  code: string;
  name: string;
  description: string | null;
  type: ShippingMethodType;
  config: ShippingMethodConfig;
  minOrderAmount: number | null;
  maxOrderAmount: number | null;
  minWeight: number | null;
  maxWeight: number | null;
  priority: number;
  isActive: boolean;
  courierConfig: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  customerGroups?: ShippingMethodCustomerGroup[];
};

export type MethodCustomerGroupRow = {
  id: string;
  customerGroupId: string;
  customerGroup: {
    id: string;
    name: string;
    description: string | null;
  };
  discountPercent: number | null;
  fixedCost: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type OrderShipping = {
  id: string;
  orderId: string;
  shippingMethodId: string;
  cost: number;
  currency: string;
  status: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  courierCode: string | null;
  courierName: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  shippingAddress: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export async function fetchShippingZones(params?: { includeInactive?: boolean }) {
  const sp = new URLSearchParams();
  if (params?.includeInactive) sp.set('includeInactive', 'true');
  const q = sp.toString();
  return fetchApi<ShippingZone[]>(`/admin/shipping/zones${q ? `?${q}` : ''}`);
}

export async function fetchShippingZone(id: string) {
  return fetchApi<ShippingZone>(`/admin/shipping/zones/${id}`);
}

export type CreateZoneBody = {
  name: string;
  description?: string;
  coverage?: ZoneCoverage;
  priority?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
};

export async function createShippingZone(body: CreateZoneBody) {
  return fetchApi<ShippingZone>('/admin/shipping/zones', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateZoneBody = Partial<CreateZoneBody>;

export async function updateShippingZone(id: string, body: UpdateZoneBody) {
  return fetchApi<ShippingZone>(`/admin/shipping/zones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteShippingZone(id: string) {
  return fetchApi<void>(`/admin/shipping/zones/${id}`, { method: 'DELETE' });
}

export async function fetchMethodsByZone(
  zoneId: string,
  params?: { includeInactive?: boolean },
) {
  const sp = new URLSearchParams();
  if (params?.includeInactive) sp.set('includeInactive', 'true');
  const q = sp.toString();
  return fetchApi<ShippingMethod[]>(
    `/admin/shipping/zones/${zoneId}/methods${q ? `?${q}` : ''}`,
  );
}

export async function fetchShippingMethod(id: string) {
  return fetchApi<ShippingMethod>(`/admin/shipping/methods/${id}`);
}

export type CreateMethodBody = {
  zoneId: string;
  code: string;
  name: string;
  description?: string;
  type: ShippingMethodType;
  config?: ShippingMethodConfig;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  minWeight?: number;
  maxWeight?: number;
  priority?: number;
  isActive?: boolean;
  courierConfig?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export async function createShippingMethod(body: CreateMethodBody) {
  return fetchApi<ShippingMethod>('/admin/shipping/methods', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateMethodBody = Partial<Omit<CreateMethodBody, 'zoneId'>>;

export async function updateShippingMethod(id: string, body: UpdateMethodBody) {
  return fetchApi<ShippingMethod>(`/admin/shipping/methods/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteShippingMethod(id: string) {
  return fetchApi<void>(`/admin/shipping/methods/${id}`, { method: 'DELETE' });
}

export async function assignShippingToOrder(orderId: string, shippingMethodId: string) {
  return fetchApi<OrderShipping>(`/admin/shipping/orders/${orderId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ shippingMethodId }),
  });
}

export type UpdateOrderShippingStatusBody = {
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  trackingUrl?: string;
};

export async function updateOrderShippingStatus(
  orderId: string,
  body: UpdateOrderShippingStatusBody,
) {
  return fetchApi<OrderShipping>(`/admin/shipping/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function fetchPublicOrderShipping(orderId: string) {
  return fetchApi<OrderShipping>(`/shipping/order/${orderId}`);
}

export async function fetchMethodCustomerGroups(methodId: string) {
  return fetchApi<MethodCustomerGroupRow[]>(
    `/admin/shipping/methods/${methodId}/customer-groups`,
  );
}

export type AssignMethodCustomerGroupBody = {
  customerGroupId: string;
  discountPercent?: number;
  fixedCost?: number;
  metadata?: Record<string, unknown>;
};

export async function assignMethodCustomerGroup(
  methodId: string,
  body: AssignMethodCustomerGroupBody,
) {
  return fetchApi<{ message: string }>(
    `/admin/shipping/methods/${methodId}/customer-groups`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export type UpdateMethodCustomerGroupBody = {
  discountPercent?: number;
  fixedCost?: number;
  metadata?: Record<string, unknown>;
};

export async function updateMethodCustomerGroupPricing(
  methodId: string,
  customerGroupId: string,
  body: UpdateMethodCustomerGroupBody,
) {
  return fetchApi<{ message: string }>(
    `/admin/shipping/methods/${methodId}/customer-groups/${customerGroupId}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  );
}

export async function removeMethodCustomerGroup(methodId: string, customerGroupId: string) {
  return fetchApi<void>(
    `/admin/shipping/methods/${methodId}/customer-groups/${customerGroupId}`,
    { method: 'DELETE' },
  );
}

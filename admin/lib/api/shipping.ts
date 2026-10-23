import { fetchApi, ApiError } from '../api-client';
import { getToken } from '../auth-token';

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

export type BookLeopardsShipmentType =
  | 'OVERNIGHT'
  | 'OVERLAND'
  | 'DETAIN';

export type BookLeopardsResult = {
  trackingNumber: string;
  trackingUrl: string;
  labelUrl: string | null;
  courierCode: string;
  courierName: string;
  shipmentType: 'overnight' | 'overland' | 'detain';
  shipping: OrderShipping;
  apiResponse: Record<string, unknown>;
};

export type BookLeopardsBody = {
  /** Preferred alias used by admin UI (ESSA parity). */
  serviceType?: BookLeopardsShipmentType;
  shipmentType?: BookLeopardsShipmentType;
  specialInstructions?: string;
  /** Manual scale weight in grams; overrides auto-calculated order weight when >= 1. */
  weightGrams?: number;
};

/** Default unit weight (kg) matching backend shipping-label / Leopards fallback. */
const DEFAULT_SHIPPING_WEIGHT_KG = 1;

/**
 * Estimate order shipping weight in grams from line-item metadata
 * (same rules as backend calculateOrderWeightKg).
 */
export function estimateOrderWeightGrams(
  items: Array<{ quantity: number; metadata?: Record<string, unknown> | null }>,
): number {
  let totalKg = 0;
  for (const item of items) {
    const qty = Math.max(0, item.quantity || 0);
    const meta = item.metadata ?? {};
    let unitKg = DEFAULT_SHIPPING_WEIGHT_KG;
    for (const key of ['weightKg', 'weight', 'shippingWeightKg'] as const) {
      const raw = meta[key];
      const n =
        typeof raw === 'number'
          ? raw
          : typeof raw === 'string'
            ? Number(raw)
            : NaN;
      if (Number.isFinite(n) && n >= 0) {
        unitKg = n;
        break;
      }
    }
    totalKg += unitKg * qty;
  }
  const kg = totalKg > 0 ? totalKg : DEFAULT_SHIPPING_WEIGHT_KG;
  return Math.max(1, Math.round(kg * 1000));
}

/** Book an order packet with Leopards Courier Merchant API. */
export async function bookOrderWithLeopards(
  orderId: string,
  body: BookLeopardsBody = {},
) {
  return fetchApi<BookLeopardsResult>(
    `/admin/shipping/leopards/book/${orderId}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export type ManualCnLeopardsResult = {
  trackingNumber: string;
  trackingUrl: string;
  courierCode: string;
  courierName: string;
};

/**
 * Persist a CN booked on the Leopards portal (no Merchant API book).
 * PATCH /admin/shipping/leopards/manual-cn/:orderId with `{ trackingCn }`.
 */
export async function assignManualLeopardsCn(
  orderId: string,
  trackingCn: string,
) {
  return fetchApi<ManualCnLeopardsResult>(
    `/admin/shipping/leopards/manual-cn/${orderId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ trackingCn }),
    },
  );
}

export type BulkBookLeopardsResultItem = {
  orderId: string;
  orderNumber?: string;
  status: 'booked' | 'skipped' | 'failed';
  cnNumber?: string;
  trackingUrl?: string;
  error?: string;
};

export type BulkBookLeopardsResult = {
  successCount: number;
  failedCount: number;
  skippedCount: number;
  results: BulkBookLeopardsResultItem[];
};

export async function bulkBookLeopardsOrders(body: {
  orderIds: string[];
  serviceType?: BookLeopardsShipmentType;
  shipmentType?: BookLeopardsShipmentType;
}) {
  return fetchApi<BulkBookLeopardsResult>(
    '/admin/shipping/leopards/bulk-book',
    {
      method: 'POST',
      body: JSON.stringify({
        orderIds: body.orderIds,
        serviceType: body.serviceType ?? body.shipmentType,
        shipmentType: body.shipmentType ?? body.serviceType,
      }),
    },
  );
}

export type LeopardsTrackEvent = {
  status: string;
  location: string | null;
  activityDate: string | null;
  activityTime: string | null;
  activityAt: string | null;
  remarks: string | null;
};

/** Normalized Leopards track response for TrackShipmentModal (ESSA parity). */
export type LeopardsTrackResult = {
  success: boolean;
  cnNumber: string;
  currentStatus: string;
  message: string | null;
  destination: string | null;
  consigneeName: string | null;
  bookingDate: string | null;
  events: LeopardsTrackEvent[];
  trackedAt: string;
};

/**
 * Live-track a booked Leopards CN.
 * POST /admin/shipping/leopards/track with `{ trackingNumber }`.
 */
export async function trackLeopardsShipment(trackingNumber: string) {
  return fetchApi<LeopardsTrackResult>('/admin/shipping/leopards/track', {
    method: 'POST',
    body: JSON.stringify({ trackingNumber }),
  });
}

/** Opens compiled shipping labels PDF (orders with CN) in a new tab. */
export async function openBulkLeopardsLabelsPdf(orderIds: string[]) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/shipping/leopards/bulk-labels`,
      {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ orderIds }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const rawMessage = (errorData as { message?: unknown })?.message;
      const message =
        typeof rawMessage === 'string'
          ? rawMessage
          : Array.isArray(rawMessage)
            ? rawMessage.join(', ')
            : `Request failed: ${response.statusText}`;
      throw new ApiError(message, response.status, errorData);
    }

    const blob = await response.blob();
    const pdfBlob =
      blob.type === 'application/pdf'
        ? blob
        : new Blob([blob], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'bulk-leopards-labels.pdf';
      anchor.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        'Leopards label PDF generation timed out. Try fewer orders.',
        408,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
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

export type LoadsheetOrderStatusFilter =
  | 'pending_loadsheet'
  | 'on_loadsheet'
  | 'all';

export type LoadsheetBookedOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  destinationCity: string;
  cnNumber: string;
  serviceType: string;
  shipperName?: string;
  pieces?: number;
  weightGrams?: number;
  codAmount: number;
  currency: string;
  loadSheetId: string | null;
  bookedAt: string | null;
  updatedAt: string;
};

export type LoadsheetBookedOrdersResponse = {
  data: LoadsheetBookedOrder[];
  meta: { total: number };
};

export type GenerateLoadsheetBody = {
  cnNumbers?: string[];
  orderIds?: string[];
  courierName?: string;
  courierCode?: string;
};

export type GenerateLoadsheetResult = {
  id?: string;
  loadSheetId: string;
  pdfUrl: string | null;
  html: string | null;
  printUrl: string | null;
  officialUrl?: string | null;
  hasStoredPdf?: boolean;
  companyName?: string;
  accountNumber?: string;
  cnNumbers: string[];
  orderIds: string[];
  packets: LoadsheetBookedOrder[];
  totals: {
    packetCount: number;
    totalPieces?: number;
    totalCod: number;
    currency: string;
  };
  generatedAt: string;
};

export type LoadsheetHistoryRow = {
  id: string;
  loadSheetId: string;
  packetCount: number;
  totalCod?: number;
  currency?: string;
  trackingNumbers: string[];
  hasStoredPdf: boolean;
  officialUrl: string | null;
  createdAt: string;
};

export type LoadsheetHistoryResponse = {
  data: LoadsheetHistoryRow[];
  meta: { total: number };
};

export async function fetchLeopardsBookedOrders(params?: {
  dateFrom?: string;
  dateTo?: string;
  status?: LoadsheetOrderStatusFilter;
}) {
  const sp = new URLSearchParams();
  if (params?.dateFrom) sp.set('dateFrom', params.dateFrom);
  if (params?.dateTo) sp.set('dateTo', params.dateTo);
  if (params?.status) sp.set('status', params.status);
  const q = sp.toString();
  return fetchApi<LoadsheetBookedOrdersResponse>(
    `/admin/shipping/loadsheets/booked-packets${q ? `?${q}` : ''}`,
  );
}

export async function generateLeopardsLoadsheet(body: GenerateLoadsheetBody) {
  return fetchApi<GenerateLoadsheetResult>(
    '/admin/shipping/loadsheets/generate',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export async function fetchLeopardsLoadsheetHistory() {
  return fetchApi<LoadsheetHistoryResponse>(
    '/admin/shipping/loadsheets/history',
  );
}

export async function fetchLeopardsLoadsheetManifest(id: string) {
  return fetchApi<GenerateLoadsheetResult>(
    `/admin/shipping/loadsheets/${encodeURIComponent(id)}`,
  );
}

/** Opens stored/re-fetched loadsheet PDF in a new tab (no new booking). */
export async function openLeopardsLoadsheetReprintPdf(id: string) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/shipping/loadsheets/${encodeURIComponent(id)}/print`,
      {
        method: 'GET',
        credentials: 'include',
        headers,
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const rawMessage = (errorData as { message?: unknown })?.message;
      const message =
        typeof rawMessage === 'string'
          ? rawMessage
          : Array.isArray(rawMessage)
            ? rawMessage.join(', ')
            : `Request failed: ${response.statusText}`;
      throw new ApiError(message, response.status, errorData);
    }

    const blob = await response.blob();
    const pdfBlob =
      blob.type === 'application/pdf'
        ? blob
        : new Blob([blob], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `leopards-loadsheet-${id}.pdf`;
      anchor.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Loadsheet PDF reprint timed out.', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

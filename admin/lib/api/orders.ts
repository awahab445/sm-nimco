import { fetchApi, ApiError } from '../api-client';
import { getToken } from '../auth-token';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus =
  | 'unfulfilled'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'shipped'
  | 'delivered';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}

export type OrderAddressSnapshot = {
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  sku: string;
  name: string;
  attributes: Record<string, unknown>;
  quantity: number;
  unitPrice: string;
  discountAmount: string;
  taxAmount: string;
  rowTotal: string;
  quantityFulfilled: number;
  quantityRefunded: number;
  metadata: Record<string, unknown>;
  createdAt: string;
};

/** True when the line is an unlisted/custom manual order item. */
export function isCustomOrderItem(
  item: Pick<OrderItem, 'productId' | 'metadata' | 'sku'>,
): boolean {
  if (item.metadata?.isCustom === true) return true;
  if (item.sku === 'CUSTOM') return true;
  return item.productId === '00000000-0000-4000-8000-0000000000c1';
}

export type OrderShippingSummary = {
  id: string;
  orderId: string;
  status: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  courierCode: string | null;
  courierName: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  metadata?: Record<string, unknown> | null;
};

/** Leopards fields stored under OrderShipping.metadata.leopards after booking. */
export function getLeopardsShippingDetails(
  shipping?: OrderShippingSummary | null,
): {
  trackingNumber: string | null;
  trackingUrl: string | null;
  slipUrl: string | null;
  loadSheetId: string | null;
} {
  const trackingNumber = shipping?.trackingNumber?.trim() || null;
  const trackingUrl = shipping?.trackingUrl?.trim() || null;
  const meta =
    shipping?.metadata &&
    typeof shipping.metadata === 'object' &&
    !Array.isArray(shipping.metadata)
      ? shipping.metadata
      : null;
  const leopards =
    meta?.leopards &&
    typeof meta.leopards === 'object' &&
    !Array.isArray(meta.leopards)
      ? (meta.leopards as Record<string, unknown>)
      : null;

  const slipRaw = leopards?.slip_link ?? leopards?.slipLink ?? leopards?.labelUrl;
  const slipUrl =
    typeof slipRaw === 'string' && slipRaw.trim() ? slipRaw.trim() : null;

  const loadRaw =
    leopards?.load_sheet_id ??
    leopards?.loadSheetId ??
    meta?.courierLoadSheetId ??
    meta?.loadSheetId;
  const loadSheetId =
    typeof loadRaw === 'string' && loadRaw.trim()
      ? loadRaw.trim()
      : loadRaw != null && String(loadRaw).trim()
        ? String(loadRaw).trim()
        : null;

  return { trackingNumber, trackingUrl, slipUrl, loadSheetId };
}

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerGroupId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  fulfillmentStatus: FulfillmentStatus | null;
  customerEmail: string;
  customerName: string | null;
  billingAddress: OrderAddressSnapshot;
  shippingAddress: OrderAddressSnapshot;
  currency: string;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  taxTotal: string;
  grandTotal: string;
  appliedPriceRules: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
  items: OrderItem[];
  shipping?: OrderShippingSummary | null;
};

/** True when the order was created from admin manual entry. */
export function isManualOrderSource(order: Pick<Order, 'metadata'>): boolean {
  const source = order.metadata?.source;
  return source === 'ADMIN_MANUAL' || source === 'manual';
}

export type OrdersListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type OrdersListResponse = {
  data: Order[];
  meta: OrdersListMeta;
};

export type AdminOrdersQuery = {
  customerId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'grandTotal';
  sortOrder?: 'asc' | 'desc';
};

export async function fetchAdminOrders(params?: AdminOrdersQuery) {
  const sp = new URLSearchParams();
  if (params?.customerId) sp.set('customerId', params.customerId);
  if (params?.status) sp.set('status', params.status);
  if (params?.paymentStatus) sp.set('paymentStatus', params.paymentStatus);
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.limit != null) sp.set('limit', String(params.limit));
  if (params?.sortBy) sp.set('sortBy', params.sortBy);
  if (params?.sortOrder) sp.set('sortOrder', params.sortOrder);
  const q = sp.toString();
  return fetchApi<OrdersListResponse>(`/admin/orders${q ? `?${q}` : ''}`);
}

export async function fetchAdminOrder(id: string) {
  return fetchApi<Order>(`/admin/orders/${id}`);
}

export type ManualOrderAddressInput = {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type ManualOrderItemInput = {
  /** Required for catalog products; omit for custom/unlisted lines. */
  productId?: string;
  variantId?: string;
  quantity: number;
  /** When set on a catalog line, charged instead of catalog unit price. */
  customUnitPrice?: number;
  /** Unlisted item flag (also implied when productId is omitted). */
  isCustom?: boolean;
  /** Display name for custom/unlisted items. */
  title?: string;
  /** Unit price for custom items. */
  unitPrice?: number;
  /** Unit weight in kg for custom items. */
  weight?: number;
};

export type ManualOrderPaymentMethod = 'cod' | 'bank_transfer';

export type CreateManualOrderBody = {
  items: ManualOrderItemInput[];
  customerEmail: string;
  customerName?: string;
  customerId?: string;
  customerGroupId?: string;
  billingAddress: ManualOrderAddressInput;
  shippingAddress: ManualOrderAddressInput;
  notes?: string;
  customDeliveryFee?: number;
  customDiscount?: number;
  currency?: string;
  paymentMethod?: ManualOrderPaymentMethod;
  sendWhatsappConfirmation?: boolean;
};

/** Create a manual admin order with optional price/delivery/discount overrides. */
export async function createManualOrder(body: CreateManualOrderBody) {
  return fetchApi<Order>('/admin/orders/manual', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateManualOrderBody = CreateManualOrderBody;

/** Update a mutable manual order (pending/processing). */
export async function updateManualOrder(id: string, body: UpdateManualOrderBody) {
  return fetchApi<Order>(`/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** True when the admin UI should offer Edit Order for this row. */
export function isManualOrderEditable(
  order: Pick<Order, 'status' | 'metadata'>,
): boolean {
  return (
    isManualOrderSource(order) &&
    (order.status === 'pending' || order.status === 'processing')
  );
}

export type UpdateOrderStatusBody = {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
};

export async function updateAdminOrderStatus(id: string, body: UpdateOrderStatusBody) {
  return fetchApi<Order>(`/admin/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export type DeleteAdminOrderResult = {
  success: boolean;
  message: string;
};

export async function deleteAdminOrder(id: string) {
  return fetchApi<DeleteAdminOrderResult>(`/admin/orders/${id}`, {
    method: 'DELETE',
  });
}

export async function downloadBulkPackageInserts(orderIds: string[]) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${API_BASE_URL}/admin/orders/bulk-package-inserts`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ orderIds }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        (errorData as { message?: string })?.message ||
          `Request failed: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'package-inserts.pdf';
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Package insert generation timed out. Try fewer orders.', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function downloadBulkShippingLabels(orderIds: string[]) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${API_BASE_URL}/admin/orders/bulk-shipping-labels`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ orderIds }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        (errorData as { message?: string })?.message ||
          `Request failed: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'shipping-labels.pdf';
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Label generation timed out. Try fewer orders.', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

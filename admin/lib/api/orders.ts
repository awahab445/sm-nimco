import { fetchApi, ApiError } from '../api-client';
import { getToken } from '../auth-token';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus =
  | 'unfulfilled'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'shipped'
  | 'delivered';

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
};

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

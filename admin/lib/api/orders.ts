import { fetchApi } from '../api-client';

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

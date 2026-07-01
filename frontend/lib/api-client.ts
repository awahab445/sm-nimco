/**
 * API Client for backend communication
 * Sends Bearer token when present (for /customers/me, /addresses, /orders/my, etc.)
 */

import { getToken, clearSession } from './auth-token';
import { getApiBaseUrl } from './api-base-url';
import { APP_CURRENCY } from './currency';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function extractApiErrorMessage(errorData: unknown, statusText: string): string {
  if (!errorData || typeof errorData !== 'object') {
    return `API Error: ${statusText}`;
  }
  const data = errorData as { message?: unknown };
  if (typeof data.message === 'string') {
    return data.message;
  }
  if (
    data.message &&
    typeof data.message === 'object' &&
    typeof (data.message as { message?: string }).message === 'string'
  ) {
    return (data.message as { message: string }).message;
  }
  return `API Error: ${statusText}`;
}

/** Low-level JSON fetch to `NEXT_PUBLIC_API_URL`. Exported for server-side CMS / layout calls. */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (typeof window !== 'undefined') {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    void clearSession();
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const errorData =
      errorText && errorText.trim().length > 0
        ? (JSON.parse(errorText) as unknown)
        : {};
    throw new ApiError(
      extractApiErrorMessage(errorData, response.statusText),
      response.status,
      errorData,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text().catch(() => '');
  if (!text || text.trim().length === 0) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

// Product types (match backend catalog response)
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name?: string;
  price: string | number;
  attributes?: Record<string, unknown>;
  position?: number;
  optionValues?: Array<{
    optionId: string;
    valueId: string;
    option: { id: string; name: string; code: string };
    value: { id: string; value: string; code?: string | null };
  }>;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
  position?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  type: string;
  description?: string | null;
  shortDescription?: string | null;
  basePrice: string | number;
  status: string;
  visibility?: string;
  variants?: ProductVariant[];
  options?: Array<{
    productId: string;
    optionId: string;
    isRequired: boolean;
    position: number;
    option: {
      id: string;
      name: string;
      code: string;
      values: Array<{
        id: string;
        value: string;
        code?: string | null;
        isActive: boolean;
        sortOrder: number;
      }>;
    };
    values: Array<{
      valueId: string;
      value: {
        id: string;
        value: string;
        code?: string | null;
        isActive: boolean;
        sortOrder: number;
      };
    }>;
  }>;
  images?: ProductImage[];
  categories?: Array<{ id: string; name?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

// Product list query params (match backend ProductQueryDto)
export interface ProductListQuery {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  price?: string;
  /** JSON string of `Record<string, string[]>`; merged server-side with legacy `brands` / `sizes`. */
  attr?: string;
  brands?: string;
  sizes?: string;
  search?: string;
  page?: number;
  limit?: number;
  attributes?: Record<string, unknown>;
}

export type FacetPanelCategory = {
  kind: 'category';
  code: string;
  name: string;
  categories: Array<{ id: string; name: string; slug: string; count: number }>;
};

export type FacetPanelPrice = {
  kind: 'price';
  code: string;
  name: string;
  priceRange: { min: number; max: number };
};

export type FacetPanelAttribute = {
  kind: 'attribute';
  code: string;
  name: string;
  options: Array<{ value: string; label: string; count: number }>;
};

export interface ProductFacets {
  matchingTotal: number;
  filterPanels: Array<FacetPanelCategory | FacetPanelPrice | FacetPanelAttribute>;
  countsApproximated?: boolean;
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Category types and API (storefront)
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  position?: number;
  productCount?: number;
}

export interface CategoryTreeItem extends Category {
  children?: CategoryTreeItem[];
}

export const categoryApi = {
  getCategories: (params?: { tree?: boolean }): Promise<{ data: Category[] } | CategoryTreeItem[]> => {
    const qs = params?.tree ? '?tree=true' : '';
    return fetchApi<{ data: Category[] } | CategoryTreeItem[]>(`/categories${qs}`);
  },

  getCategoryBySlug: (slug: string): Promise<Category> =>
    fetchApi<Category>(`/categories/slug/${encodeURIComponent(slug)}`),
};

/** Layered mega menu node (from Store navigation). */
export interface StorefrontNavMegaNode {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  children?: StorefrontNavMegaNode[];
}

/** Header bar link (Admin → Store navigation). */
export interface StorefrontNavItem {
  id: string;
  label: string;
  secondaryLabel: string | null;
  href: string;
  sortOrder: number;
  openMegaMenu: boolean;
  bannerImageUrl?: string | null;
  bannerHref?: string | null;
  bannerAlt?: string | null;
}

export interface StorefrontNavigationPayload {
  header: StorefrontNavItem[];
  megaMenu: StorefrontNavMegaNode[];
}

export const STOREFRONT_NAV_FALLBACK: StorefrontNavigationPayload = {
  header: [
    { id: '00000000-0000-0000-0000-00000000e001', label: 'Home', secondaryLabel: null, href: '/', sortOrder: 0, openMegaMenu: false },
    { id: '00000000-0000-0000-0000-00000000e002', label: 'Products', secondaryLabel: 'Categories', href: '/products', sortOrder: 10, openMegaMenu: true },
    { id: '00000000-0000-0000-0000-00000000e003', label: 'Track order', secondaryLabel: null, href: '/track-order', sortOrder: 20, openMegaMenu: false },
    { id: '00000000-0000-0000-0000-00000000e005', label: 'Cart', secondaryLabel: null, href: '/cart', sortOrder: 40, openMegaMenu: false },
  ],
  megaMenu: [],
};

function normalizeNavHref(href: string): string {
  const path = (href.trim().split('?')[0]?.split('#')[0] ?? '/').toLowerCase();
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path || '/';
}

/** Merge API nav with fallback so CMS-only responses do not replace core header links. */
export function mergeStorefrontNavigation(
  api: StorefrontNavigationPayload,
  fallback: StorefrontNavigationPayload = STOREFRONT_NAV_FALLBACK,
): StorefrontNavigationPayload {
  const dbHeader = api.header.filter((item) => !item.id.startsWith('cms:'));
  const cmsHeader = api.header.filter((item) => item.id.startsWith('cms:'));

  const baseHeader = dbHeader.length > 0 ? dbHeader : fallback.header;

  const byHref = new Map<string, StorefrontNavItem>();
  for (const item of baseHeader) {
    byHref.set(normalizeNavHref(item.href), item);
  }
  for (const item of cmsHeader) {
    const key = normalizeNavHref(item.href);
    if (!byHref.has(key)) {
      byHref.set(key, item);
    }
  }

  const header = [...byHref.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  const megaMenu = api.megaMenu?.length ? api.megaMenu : fallback.megaMenu;

  return { header, megaMenu };
}

export const storefrontNavApi = {
  getNavigation: (): Promise<{ data: StorefrontNavigationPayload }> =>
    fetchApi<{ data: StorefrontNavigationPayload }>('/storefront/navigation'),
};

export type PlpBrowseTreeNode = {
  id: string;
  label: string;
  href: string;
  categoryId: string | null;
  sortOrder: number;
  children?: PlpBrowseTreeNode[];
};

export const plpBrowseApi = {
  getBrowseTree: (): Promise<{ data: { label: string; tree: PlpBrowseTreeNode[] } }> =>
    fetchApi<{ data: { label: string; tree: PlpBrowseTreeNode[] } }>('/storefront/plp-browse-tree'),
};

// Product API
export const productApi = {
  listProducts: (query?: ProductListQuery): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    if (query) {
      if (query.category != null) params.set('category', query.category);
      if (query.minPrice != null) params.set('minPrice', String(query.minPrice));
      if (query.maxPrice != null) params.set('maxPrice', String(query.maxPrice));
      if (query.price != null) params.set('price', query.price);
      if (query.attr != null && query.attr !== '') params.set('attr', query.attr);
      if (query.brands != null && query.brands !== '') params.set('brands', query.brands);
      if (query.sizes != null && query.sizes !== '') params.set('sizes', query.sizes);
      if (query.search != null) params.set('search', query.search);
      if (query.page != null) params.set('page', String(query.page));
      if (query.limit != null) params.set('limit', String(query.limit));
      if (query.attributes != null) params.set('attributes', JSON.stringify(query.attributes));
    }
    const qs = params.toString();
    return fetchApi<ProductListResponse>(`/products${qs ? `?${qs}` : ''}`);
  },

  getFacets: (query?: ProductListQuery): Promise<ProductFacets> => {
    const params = new URLSearchParams();
    if (query) {
      if (query.category != null) params.set('category', query.category);
      if (query.minPrice != null) params.set('minPrice', String(query.minPrice));
      if (query.maxPrice != null) params.set('maxPrice', String(query.maxPrice));
      if (query.price != null) params.set('price', query.price);
      if (query.attr != null && query.attr !== '') params.set('attr', query.attr);
      if (query.brands != null && query.brands !== '') params.set('brands', query.brands);
      if (query.sizes != null && query.sizes !== '') params.set('sizes', query.sizes);
      if (query.search != null) params.set('search', query.search);
      if (query.attributes != null) params.set('attributes', JSON.stringify(query.attributes));
    }
    const qs = params.toString();
    return fetchApi<ProductFacets>(`/products/facets${qs ? `?${qs}` : ''}`);
  },

  getProductById: (id: string) => fetchApi<Product>(`/products/id/${encodeURIComponent(id)}`),

  getProductBySlug: (slug: string) => fetchApi<Product>(`/products/${encodeURIComponent(slug)}`),

  /** Lightweight search for suggestions (debounced dropdown). Backend requires min 2 chars. */
  searchSuggestions: (
    q: string,
    limit?: number,
    options?: { signal?: AbortSignal },
  ): Promise<{ data: Array<Pick<Product, 'id' | 'name' | 'slug' | 'basePrice'> & { images: Array<{ url: string }> }>; total: number }> => {
    const params = new URLSearchParams({ q: q.trim() });
    if (limit != null) params.set('limit', String(limit));
    return fetchApi(`/products/search?${params.toString()}`, options ?? {});
  },
};

// Inventory availability (for product cards / PDP)
export const inventoryApi = {
  getAvailability: (variantIds: string[]): Promise<{ data: Record<string, number> }> => {
    if (variantIds.length === 0) return Promise.resolve({ data: {} });
    const qs = new URLSearchParams({ variantIds: variantIds.join(',') }).toString();
    return fetchApi<{ data: Record<string, number> }>(`/inventory/availability?${qs}`);
  },
};

// Cart API (enriched items include productName, variantName, variantAttributes, productImage from backend)
export interface CartItem {
  variantId: string;
  productId: string;
  quantity: number;
  price: number;
  currency: string;
  attributes: Record<string, unknown>;
  reservationId: string;
  addedAt: string;
  productName?: string;
  variantName?: string;
  variantAttributes?: Record<string, unknown>;
  productImage?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export const cartApi = {
  createCart: (currency: string = APP_CURRENCY) =>
    fetchApi<{ cartId: string }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ currency }),
    }),

  getCart: (cartId: string) => fetchApi<Cart>(`/cart/${encodeURIComponent(cartId)}`),

  addItem: (cartId: string, body: { productId: string; variantId: string; quantity: number }) =>
    fetchApi<Cart>(`/cart/${encodeURIComponent(cartId)}/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateItem: (cartId: string, variantId: string, body: { quantity: number }) =>
    fetchApi<Cart>(`/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(variantId)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  removeItem: (cartId: string, variantId: string) =>
    fetchApi<Cart>(`/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(variantId)}`, {
      method: 'DELETE',
    }),

  clearCart: (cartId: string) =>
    fetchApi<void>(`/cart/${encodeURIComponent(cartId)}`, { method: 'DELETE' }),
};

// Checkout API
export const checkoutApi = {
  startCheckout: (
    cartId: string,
    options?: { customerId?: string; customerEmail?: string },
  ) =>
    fetchApi<{ checkoutId: string }>('/checkout/start', {
      method: 'POST',
      body: JSON.stringify({
        cartId,
        ...(options?.customerId && { customerId: options.customerId }),
        ...(options?.customerEmail && { customerEmail: options.customerEmail }),
      }),
    }),

  getCheckout: (checkoutId: string) =>
    fetchApi<CheckoutSession>(`/checkout/${checkoutId}`),

  updateAddress: (checkoutId: string, addresses: {
    billingAddress?: Address;
    shippingAddress?: Address;
  }) =>
    fetchApi<CheckoutSession>(`/checkout/${checkoutId}/address`, {
      method: 'POST',
      body: JSON.stringify(addresses),
    }),

  updateShipping: (checkoutId: string, shipping: ShippingMethod) =>
    fetchApi<CheckoutSession>(`/checkout/${checkoutId}/shipping`, {
      method: 'POST',
      body: JSON.stringify(shipping),
    }),

  /** Set guest customer by email (get-or-create). Call when guest enters email at checkout. */
  setGuestCustomer: (checkoutId: string, customerEmail: string) =>
    fetchApi<CheckoutSession>(`/checkout/${checkoutId}/customer`, {
      method: 'POST',
      body: JSON.stringify({ customerEmail }),
    }),

  /** Apply or clear coupon. Pass empty string to clear. */
  applyCoupon: (checkoutId: string, couponCode: string) =>
    fetchApi<CheckoutSession>(`/checkout/${checkoutId}/coupon`, {
      method: 'POST',
      body: JSON.stringify({ couponCode: couponCode.trim() }),
    }),

  updateItemQuantity: (checkoutId: string, variantId: string, quantity: number) =>
    fetchApi<CheckoutSession>(`/checkout/${checkoutId}/items/${encodeURIComponent(variantId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  confirmCheckout: (
    checkoutId: string,
    data: {
      customerEmail: string;
      customerName?: string;
      customerId?: string;
      customerGroupId?: string;
      paymentMethodCode: string;
      notes?: string;
      returnUrl?: string;
      cancelUrl?: string;
    },
  ) =>
    fetchApi<{
      orderId: string;
      orderNumber: string;
      paymentIntent?: {
        paymentId: string;
        gatewayTransactionId?: string;
        flowType: 'redirect' | 'hosted' | 'client_side';
        clientSecret?: string;
        redirectUrl?: string;
      };
    }>(`/checkout/${checkoutId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Shipping API
export const shippingApi = {
  calculateShipping: (data: {
    shippingAddress: {
      country?: string;
      region?: string;
      city?: string;
      postalCode?: string;
    };
    items: Array<{
      variantId: string;
      quantity: number;
      price: number;
      weight?: number;
    }>;
    subtotal?: number;
    currency?: string;
    customerGroupId?: string;
  }) =>
    fetchApi<Array<{
      methodId: string;
      methodCode: string;
      methodName: string;
      cost: number;
      currency: string;
      estimatedDays?: number;
      description?: string;
    }>>('/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Promotions API
export interface ValidatePromotionItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  categoryIds?: string[];
}

export const promotionApi = {
  getActivePromotions: () =>
    fetchApi<Array<{
      id: string;
      code: string | null;
      name: string;
      description?: string | null;
      type: string;
      discountValue?: number | null;
      discountType?: string;
      status: string;
    }>>('/promotions'),

  validatePromotion: (
    promotionId: string,
    data: {
      subtotal: number;
      items: ValidatePromotionItem[];
      customerId?: string;
      customerGroupId?: string;
      couponCode?: string;
    },
  ) =>
    fetchApi<{ eligible: boolean; reason?: string; discountAmount?: number }>(
      `/promotions/${encodeURIComponent(promotionId)}/validate`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    ),
};

// Subscription API
export type SubscriptionPlan = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: unknown;
  isActive: boolean;
};

export const subscriptionApi = {
  listPlans: () => fetchApi<SubscriptionPlan[]>('/subscription/plans'),
  mySubscription: () => fetchApi('/subscription/my-subscription'),
  /** Public newsletter signup (email + optional source). */
  subscribe: (data: { email: string; source?: string }) =>
    fetchApi<{ message?: string }>('/subscription/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancel: (reason?: string) =>
    fetchApi('/subscription/cancel', {
      method: 'POST',
      body: JSON.stringify(reason ? { reason } : {}),
    }),
  renew: (data?: { paymentMethod?: string; transactionRef?: string }) =>
    fetchApi('/subscription/renew', {
      method: 'POST',
      body: JSON.stringify(data ?? {}),
    }),
  changePlan: (data: { planId: string; paymentMethod?: string; transactionRef?: string }) =>
    fetchApi('/subscription/change-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Payment API
export const paymentApi = {
  getPaymentMethods: () =>
    fetchApi<Array<{
      code: string;
      name: string;
      provider: string;
      flowType: string;
      type: string;
      metadata?: Record<string, any>;
    }>>('/payments/methods'),

  createIntent: (data: {
    orderId: string;
    paymentMethodCode: string;
    returnUrl?: string;
    cancelUrl?: string;
  }) =>
    fetchApi<{
      paymentId: string;
      gatewayTransactionId?: string;
      flowType: 'redirect' | 'hosted' | 'client_side';
      clientSecret?: string;
      redirectUrl?: string;
      metadata?: Record<string, any>;
    }>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPayment: (paymentId: string) =>
    fetchApi(`/payments/${paymentId}`),

  /** Get all payments for an order (for success page and polling). */
  getPaymentsByOrder: (orderId: string) =>
    fetchApi<Array<{
      id: string;
      orderId: string;
      status: string;
      amount: number | string;
      currency: string;
      gatewayTransactionId?: string | null;
      paymentMethod?: { code: string; name: string; provider: string };
    }>>(`/payments/order/${encodeURIComponent(orderId)}`),
  trackPayments: (orderNumber: string, email: string) =>
    fetchApi<Array<{
      id: string;
      orderId: string;
      status: string;
      amount: number | string;
      currency: string;
      gatewayTransactionId?: string | null;
      paymentMethod?: { code: string; name: string; provider: string };
    }>>(`/payments/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`),
};

// Order API
export const orderApi = {
  getOrder: (orderId: string): Promise<{ id: string; [key: string]: unknown }> =>
    fetchApi(`/orders/${orderId}`),
  getOrderByNumber: (orderNumber: string): Promise<{ id: string; [key: string]: unknown }> =>
    fetchApi(`/orders/number/${orderNumber}`),
  trackOrder: (orderNumber: string, email: string) =>
    fetchApi<{ id: string; [key: string]: unknown }>(
      `/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`,
    ),
  getMyOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return fetchApi<{
      data: Array<{
        id: string;
        orderNumber: string;
        status: string;
        paymentStatus: string;
        fulfillmentStatus: string;
        customerEmail: string;
        customerName?: string;
        currency: string;
        subtotal: number;
        discountTotal: number;
        shippingTotal: number;
        taxTotal: number;
        grandTotal: number;
        createdAt: string;
        items: Array<{
          id: string;
          name: string;
          quantity: number;
          unitPrice: number;
          rowTotal: number;
          productId?: string;
          variantId?: string | null;
        }>;
      }>;
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/orders/my${query ? `?${query}` : ''}`);
  },
};

// Customer API
export interface CustomerProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isGuest: boolean;
  customerGroupId: string;
  customerGroup?: {
    id: string;
    name: string;
    isDefault: boolean;
    taxClassId?: string;
    discountPercent?: number;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomerProfileDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const customerApi = {
  getProfile: () => fetchApi<CustomerProfile>('/customers/me'),
  updateProfile: (data: UpdateCustomerProfileDto) =>
    fetchApi<CustomerProfile>('/customers/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  /** Get or create customer by email (for guest checkout). No auth required. */
  getOrCreateByEmail: (email: string, isGuest = true) => {
    const params = new URLSearchParams({ email });
    if (!isGuest) params.set('isGuest', 'false');
    return fetchApi<{ id: string; email: string; customerGroupId: string; isGuest?: boolean }>(
      `/customers/get-or-create?${params}`,
    );
  },
};

// Keys allowed in address create/update (backend DTO forbids extra properties like id, customerId, createdAt, updatedAt)
const ADDRESS_UPDATE_KEYS = [
  'label',
  'firstName',
  'lastName',
  'company',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'country',
  'phone',
  'isDefaultBilling',
  'isDefaultShipping',
] as const;

function addressUpdateBody(data: Record<string, unknown>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const key of ADDRESS_UPDATE_KEYS) {
    if (key in data && data[key] !== undefined) {
      body[key] = data[key];
    }
  }
  return body;
}

// Address API
export const addressApi = {
  getAddresses: () => fetchApi<AddressWithId[]>('/addresses'),
  createAddress: (data: Address & { isDefaultBilling?: boolean; isDefaultShipping?: boolean }) =>
    fetchApi<AddressWithId>('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressUpdateBody({ ...data })),
    }),
  updateAddress: (id: string, data: Address | AddressWithId) =>
    fetchApi<AddressWithId>(`/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(addressUpdateBody({ ...data })),
    }),
  deleteAddress: (id: string) =>
    fetchApi<void>(`/addresses/${id}`, {
      method: 'DELETE',
    }),
  setDefaultBilling: (id: string) =>
    fetchApi<AddressWithId>(`/addresses/${id}/default-billing`, {
      method: 'POST',
    }),
  setDefaultShipping: (id: string) =>
    fetchApi<AddressWithId>(`/addresses/${id}/default-shipping`, {
      method: 'POST',
    }),
};

// Types
export interface Address {
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface AddressWithId extends Address {
  id: string;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShippingMethod {
  methodId: string;
  methodName: string;
  cost: number;
  currency: string;
  estimatedDays: number;
}

export interface CheckoutItem {
  variantId: string;
  productId: string;
  quantity: number;
  price: number;
  currency: string;
  attributes: Record<string, unknown>;
  reservationId: string;
  productName?: string;
  productImage?: string;
  variantName?: string;
  /** Variant attributes for display (e.g. size, color) */
  variantAttributes?: Record<string, unknown>;
}

export interface CheckoutSession {
  id: string;
  cartId: string;
  items: CheckoutItem[];
  currency: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  shippingMethod?: ShippingMethod;
  customerEmail?: string;
  customerName?: string;
  customerId?: string;
  customerGroupId?: string;
  couponCode?: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}


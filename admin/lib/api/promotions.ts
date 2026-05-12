import { fetchApi } from '../api-client';

export type PromotionType = 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
export type PromotionScope = 'cart' | 'product' | 'category';
export type PromotionLifecycleStatus = 'draft' | 'active' | 'expired' | 'disabled';

export type PromotionConditions = {
  minOrderAmount?: number;
  products?: string[];
  categories?: string[];
  customerGroups?: string[];
  maxDiscountAmount?: number;
};

export type PromotionProductRow = {
  id: string;
  promotionId: string;
  productId: string | null;
  variantId: string | null;
  categoryId: string | null;
};

export type PromotionCustomerGroupRow = {
  id: string;
  promotionId: string;
  customerGroupId: string;
  isExcluded: boolean;
};

export type Promotion = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  type: PromotionType;
  status: PromotionLifecycleStatus;
  discountValue: number | null;
  discountType: 'percentage' | 'fixed_amount' | null;
  scope: PromotionScope;
  isStackable: boolean;
  isExclusive: boolean;
  appliesToAllGroups: boolean;
  conditions: PromotionConditions;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  currentUsage: number;
  startDate: string | null;
  endDate: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  promotionProducts?: PromotionProductRow[];
  promotionCustomerGroups?: PromotionCustomerGroupRow[];
};

export type PromotionLog = {
  id: string;
  promotionId: string;
  cartId: string | null;
  checkoutId: string | null;
  orderId: string | null;
  customerId: string | null;
  couponCode: string | null;
  discountAmount: number;
  subtotalBefore: number;
  subtotalAfter: number;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CreatePromotionBody = {
  code?: string;
  name: string;
  description?: string;
  type: PromotionType;
  scope?: PromotionScope;
  discountValue?: number;
  discountType?: 'percentage' | 'fixed_amount';
  isStackable?: boolean;
  isExclusive?: boolean;
  conditions?: PromotionConditions;
  usageLimit?: number;
  usageLimitPerUser?: number;
  startDate?: string;
  endDate?: string;
  productIds?: string[];
  variantIds?: string[];
  categoryIds?: string[];
  appliesToAllGroups?: boolean;
  eligibleCustomerGroupIds?: string[];
  excludedCustomerGroupIds?: string[];
  metadata?: Record<string, unknown>;
};

export async function fetchPromotions(options?: { allStatuses?: boolean }) {
  const sp = new URLSearchParams();
  if (options?.allStatuses) sp.set('allStatuses', 'true');
  const q = sp.toString();
  return fetchApi<Promotion[]>(`/promotions${q ? `?${q}` : ''}`);
}

export async function fetchPromotion(id: string) {
  return fetchApi<Promotion>(`/promotions/${id}`);
}

export async function createPromotion(body: CreatePromotionBody) {
  return fetchApi<Promotion>('/promotions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type PatchPromotionBody = {
  status?: 'draft' | 'active' | 'disabled';
};

export async function patchPromotion(id: string, body: PatchPromotionBody) {
  return fetchApi<Promotion>(`/promotions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deletePromotion(id: string) {
  return fetchApi<void>(`/promotions/${id}`, {
    method: 'DELETE',
  });
}

export type ValidateCartItem = {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  categoryIds?: string[];
};

export type ValidatePromotionBody = {
  subtotal: number;
  items: ValidateCartItem[];
  customerId?: string;
  customerGroupId?: string;
  couponCode?: string;
};

export type ValidatePromotionResult = {
  eligible: boolean;
  reason?: string;
  discountAmount?: number;
};

export async function validatePromotion(id: string, body: ValidatePromotionBody) {
  return fetchApi<ValidatePromotionResult>(`/promotions/${id}/validate`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchPromotionLogs(
  id: string,
  params?: { cartId?: string; checkoutId?: string; orderId?: string },
) {
  const sp = new URLSearchParams();
  if (params?.cartId) sp.set('cartId', params.cartId);
  if (params?.checkoutId) sp.set('checkoutId', params.checkoutId);
  if (params?.orderId) sp.set('orderId', params.orderId);
  const q = sp.toString();
  return fetchApi<PromotionLog[]>(`/promotions/${id}/logs${q ? `?${q}` : ''}`);
}

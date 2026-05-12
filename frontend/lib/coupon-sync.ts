/**
 * Centralized coupon validation (Promotions API + DB-backed rules) and
 * localStorage persistence so cart and checkout stay in sync.
 */

import {
  promotionApi,
  ValidatePromotionItem,
  CartItem,
  CheckoutItem,
} from './api-client';

export const PENDING_COUPON_STORAGE_KEY = 'ecom-pending-coupon-code';

export function getPendingCouponCode(): string | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(PENDING_COUPON_STORAGE_KEY)?.trim();
  return v || null;
}

export function setPendingCouponCode(code: string): void {
  if (typeof window === 'undefined') return;
  const t = code.trim();
  if (t) localStorage.setItem(PENDING_COUPON_STORAGE_KEY, t);
}

export function clearPendingCouponCode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_COUPON_STORAGE_KEY);
}

/** Map backend rule messages to storefront copy. */
export function formatPromotionReasonForUser(reason?: string): string {
  if (!reason) return 'This coupon is not applicable to your cart.';
  const r = reason.toLowerCase();
  if (r.includes('expired')) return 'This coupon has expired.';
  if (r.includes('not started')) return 'This coupon is not active yet.';
  if (r.includes('invalid coupon')) return 'Invalid coupon code.';
  if (r.includes('minimum order amount') || r.includes('minimum spend'))
    return 'Minimum spend not met for this coupon.';
  if (r.includes('minimum') && r.includes('required'))
    return 'Minimum spend not met for this coupon.';
  if (r.includes('usage limit')) return 'This coupon has reached its usage limit.';
  if (r.includes('not active')) return 'This coupon is not valid.';
  if (r.includes('no eligible products')) return 'No eligible products in your cart for this coupon.';
  if (r.includes('no eligible categories')) return 'No eligible items in your cart for this coupon.';
  return reason;
}

export function cartItemsToValidateItems(items: CartItem[]): ValidatePromotionItem[] {
  return items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    price: item.price,
  }));
}

export function checkoutItemsToValidateItems(items: CheckoutItem[]): ValidatePromotionItem[] {
  return items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    price: item.price,
  }));
}

export type ValidateCouponOk = {
  ok: true;
  promotionId: string;
  appliedCode: string;
  discountAmount: number;
  isFreeShipping: boolean;
};

export type ValidateCouponErr = { ok: false; message: string };

export async function validateCouponCodeForCartLike(params: {
  code: string;
  subtotal: number;
  items: ValidatePromotionItem[];
  customerId?: string;
  customerGroupId?: string;
}): Promise<ValidateCouponOk | ValidateCouponErr> {
  const trimmed = params.code.trim();
  if (!trimmed) return { ok: false, message: 'Please enter a coupon code.' };

  let promotions;
  try {
    promotions = await promotionApi.getActivePromotions();
  } catch {
    return { ok: false, message: 'Unable to verify coupon. Please try again.' };
  }

  const promotion = promotions.find(
    (p) => p.code && p.code.toLowerCase() === trimmed.toLowerCase(),
  );
  if (!promotion) {
    return { ok: false, message: 'Invalid coupon code.' };
  }

  const isFreeShipping = promotion.type === 'free_shipping';

  let result: { eligible: boolean; reason?: string; discountAmount?: number };
  try {
    result = await promotionApi.validatePromotion(promotion.id, {
      subtotal: params.subtotal,
      items: params.items,
      customerId: params.customerId,
      customerGroupId: params.customerGroupId,
      couponCode: trimmed,
    });
  } catch {
    return { ok: false, message: 'Unable to verify coupon. Please try again.' };
  }

  if (!result.eligible) {
    return { ok: false, message: formatPromotionReasonForUser(result.reason) };
  }

  const discountAmount = result.discountAmount ?? 0;
  if (!isFreeShipping && discountAmount <= 0) {
    return { ok: false, message: 'This coupon is not applicable to your cart.' };
  }

  return {
    ok: true,
    promotionId: promotion.id,
    appliedCode: promotion.code!,
    discountAmount,
    isFreeShipping,
  };
}

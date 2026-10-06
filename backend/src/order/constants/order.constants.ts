/** Storefront checkout / website orders. */
export const ORDER_SOURCE_DIRECT_WEB = 'DIRECT_WEB';

/** Admin-created manual orders (catalog + custom lines). */
export const ORDER_SOURCE_ADMIN_MANUAL = 'ADMIN_MANUAL';

/** Legacy alias used by some M. Essa–era payloads. */
export const ORDER_SOURCE_MANUAL = 'manual';

export function isAdminManualOrderSource(
  source: unknown,
): source is typeof ORDER_SOURCE_ADMIN_MANUAL | typeof ORDER_SOURCE_MANUAL {
  return source === ORDER_SOURCE_ADMIN_MANUAL || source === ORDER_SOURCE_MANUAL;
}

export const MANUAL_ORDER_PAYMENT_METHODS = ['cod', 'bank_transfer'] as const;
export type ManualOrderPaymentMethod =
  (typeof MANUAL_ORDER_PAYMENT_METHODS)[number];

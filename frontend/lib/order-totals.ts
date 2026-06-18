/**
 * Normalize monetary fields from order API responses (Prisma Decimal → string).
 */
export function parseOrderAmount(value: unknown): number {
  const amount = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(amount) ? amount : 0;
}

/** Read shipping from any supported order field name. */
export function getOrderShippingFee(order: Record<string, unknown>): number {
  return parseOrderAmount(
    order.shippingTotal ?? order.shippingFee ?? order.shippingPrice ?? 0,
  );
}

export interface NormalizedOrderTotals {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export function normalizeOrderTotals(
  order: Record<string, unknown>,
): NormalizedOrderTotals {
  const subtotal = parseOrderAmount(order.subtotal);
  const discountTotal = parseOrderAmount(order.discountTotal);
  const shippingTotal = getOrderShippingFee(order);
  const taxTotal = parseOrderAmount(order.taxTotal);
  const grandTotal = parseOrderAmount(order.grandTotal);

  return {
    subtotal,
    discountTotal,
    shippingTotal,
    taxTotal,
    grandTotal:
      grandTotal > 0
        ? grandTotal
        : Math.max(0, subtotal - discountTotal + shippingTotal + taxTotal),
  };
}

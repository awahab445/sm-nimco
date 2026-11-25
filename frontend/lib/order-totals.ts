/** Round to 2 decimal places — Meta Purchase `value` / `item_price` require this. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Normalize monetary fields from order API responses
 * (number, Prisma Decimal string, or Decimal-like `{ toNumber() }`).
 */
export function parseOrderAmount(value: unknown): number {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? roundMoney(value) : 0;
  }
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(/,/g, '').trim());
    return Number.isFinite(n) ? roundMoney(n) : 0;
  }
  if (typeof value === 'object') {
    const obj = value as { toNumber?: () => unknown; toString?: () => string };
    if (typeof obj.toNumber === 'function') {
      const n = Number(obj.toNumber());
      return Number.isFinite(n) ? roundMoney(n) : 0;
    }
    if (typeof obj.toString === 'function') {
      const s = obj.toString();
      if (s && s !== '[object Object]') {
        const n = parseFloat(s.replace(/,/g, ''));
        return Number.isFinite(n) ? roundMoney(n) : 0;
      }
    }
  }
  return 0;
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

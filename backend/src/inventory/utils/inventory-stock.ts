/**
 * Pure helpers for inventory quantity comparisons.
 * Always coerce to non-negative integers so string/Decimal values cannot invert checks
 * (e.g. `"62" > "100"` in JavaScript).
 */

export function toStockQty(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

/**
 * Units the caller may still claim: free available stock plus any of their own
 * reservation that will be released/replaced in the same request.
 */
export function effectiveAvailableStock(
  availableQuantity: unknown,
  creditOwnReservedQuantity: unknown = 0,
): number {
  return toStockQty(availableQuantity) + toStockQty(creditOwnReservedQuantity);
}

export function hasEnoughStock(
  availableQuantity: unknown,
  requestedQuantity: unknown,
  creditOwnReservedQuantity: unknown = 0,
): boolean {
  return (
    effectiveAvailableStock(availableQuantity, creditOwnReservedQuantity) >=
    toStockQty(requestedQuantity)
  );
}

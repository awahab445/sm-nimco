/** Pakistan sales tax / GST applied on storefront order subtotals. */
export const DEFAULT_GST_RATE_PERCENT = 18;

/** Round money to 2 decimal places (PKR style). */
export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate GST/sales tax on a taxable amount.
 * `ratePercent` is a whole percentage (e.g. 18 for 18%).
 */
export function calculateGstAmount(
  taxableAmount: number,
  ratePercent: number = DEFAULT_GST_RATE_PERCENT,
): number {
  const base = Math.max(0, Number.isFinite(taxableAmount) ? taxableAmount : 0);
  const rate = Math.max(0, Number.isFinite(ratePercent) ? ratePercent : 0);
  return roundMoney(base * (rate / 100));
}

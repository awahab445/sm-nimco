/**
 * Dual per-kg courier zone pricing + GST helpers.
 */
export function calculateDualTierBaseShipping(
  totalWeightKg: number,
  rates: {
    rateLessThan10kg: number;
    rateGreaterOrEqual10kg: number;
  },
): number {
  const weight = Math.max(0, totalWeightKg);
  const perKg =
    weight < 10
      ? Math.max(0, rates.rateLessThan10kg)
      : Math.max(0, rates.rateGreaterOrEqual10kg);
  return weight * perKg;
}

export function applyShippingGst(
  baseShipping: number,
  shippingGstPercentage: number,
): number {
  const base = Math.max(0, baseShipping);
  const pct = Number.isFinite(shippingGstPercentage)
    ? Math.max(0, shippingGstPercentage)
    : 0;
  return base * (1 + pct / 100);
}

/** Round money to 2 decimal places for shipping fees. */
export function roundShippingFee(amount: number): number {
  return Math.round(Math.max(0, amount) * 100) / 100;
}

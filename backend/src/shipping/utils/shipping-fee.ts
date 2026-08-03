/**
 * Courier zone shipping: 4-tier weight slabs + GST helpers.
 *
 * Slabs (billing weight × applicable per-kg rate):
 * 1. weight ≤ 3kg   → bill 3kg  @ rateLessThan10kg
 * 2. 3kg < w ≤ 5kg  → bill 5kg  @ rateLessThan10kg
 * 3. 5kg < w < 10kg → bill actual @ rateLessThan10kg
 * 4. weight ≥ 10kg  → bill actual @ rateGreaterOrEqual10kg
 */

export type CourierZoneRates = {
  rateLessThan10kg: number;
  rateGreaterOrEqual10kg: number;
};

export type ShippingSlabResult = {
  /** 1–4 matching the weight slab rules */
  slab: 1 | 2 | 3 | 4;
  billingWeightKg: number;
  ratePerKg: number;
  baseShipping: number;
};

export function resolveShippingSlab(
  totalWeightKg: number,
  rates: CourierZoneRates,
): ShippingSlabResult {
  const weight = Math.max(0, totalWeightKg);
  const rateLt10 = Math.max(0, rates.rateLessThan10kg);
  const rateGte10 = Math.max(0, rates.rateGreaterOrEqual10kg);

  if (weight <= 3) {
    return {
      slab: 1,
      billingWeightKg: 3,
      ratePerKg: rateLt10,
      baseShipping: 3 * rateLt10,
    };
  }
  if (weight <= 5) {
    return {
      slab: 2,
      billingWeightKg: 5,
      ratePerKg: rateLt10,
      baseShipping: 5 * rateLt10,
    };
  }
  if (weight < 10) {
    return {
      slab: 3,
      billingWeightKg: weight,
      ratePerKg: rateLt10,
      baseShipping: weight * rateLt10,
    };
  }
  return {
    slab: 4,
    billingWeightKg: weight,
    ratePerKg: rateGte10,
    baseShipping: weight * rateGte10,
  };
}

export function calculateDualTierBaseShipping(
  totalWeightKg: number,
  rates: CourierZoneRates,
): number {
  return resolveShippingSlab(totalWeightKg, rates).baseShipping;
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

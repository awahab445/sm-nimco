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

export type WeightBasedMethodConfig = {
  baseCost?: unknown;
  costPerKg?: unknown;
  baseCostKgLimit?: unknown;
};

function parseNonNegativeAmount(value: unknown): number {
  const amount =
    typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

/** Billable kilograms: always round total order weight UP to the nearest integer kg. */
export function toBillableKg(weightInKg: number): number {
  const weight = Number.isFinite(weightInKg) ? Math.max(0, weightInKg) : 0;
  return Math.ceil(weight);
}

export const KARACHI_STANDARD_METHOD_CODE = 'karachi_standard';
export const KARACHI_STANDARD_METHOD_NAME = 'Standard Karachi Delivery';
export const KARACHI_FREE_DELIVERY_THRESHOLD = 3000;
export const KARACHI_FLAT_RATE_UP_TO_5KG = 250;
export const KARACHI_FLAT_RATE_OVER_5KG = 300;

export function isKarachiCity(city?: string | null): boolean {
  return city?.trim().toLowerCase() === 'karachi';
}

/** Karachi local delivery: ≤5 billable kg → Rs. 250; above 5 kg → Rs. 300. */
export function calculateKarachiShippingFee(weightInKg: number): number {
  const billableKg = toBillableKg(weightInKg);
  return roundShippingFee(
    billableKg <= 5 ? KARACHI_FLAT_RATE_UP_TO_5KG : KARACHI_FLAT_RATE_OVER_5KG,
  );
}

/** Free delivery when cart subtotal meets the admin-configured threshold. */
export function qualifiesForFreeDelivery(params: {
  subtotal: number;
  freeDeliveryThreshold: number;
}): boolean {
  const threshold = Number(params.freeDeliveryThreshold);
  const subtotal = Number(params.subtotal);
  if (!Number.isFinite(threshold) || threshold <= 0) return false;
  return Number.isFinite(subtotal) && subtotal >= threshold;
}

/**
 * Weight-based shipping from method Config JSON:
 * - Economy (`economy_shipping`): within limit → baseCost;
 *   else baseCost + ((billableKg - baseCostKgLimit) * costPerKg)
 * - Overland (`overland_shipping`): within limit → baseCost;
 *   else billableKg * costPerKg
 */
export function calculateWeightBasedShippingFee(
  weightInKg: number,
  config: WeightBasedMethodConfig,
  methodCode?: string,
): number {
  const billableKg = toBillableKg(weightInKg);
  const baseCost = parseNonNegativeAmount(config.baseCost);
  const costPerKg = parseNonNegativeAmount(config.costPerKg);
  const baseCostKgLimit = parseNonNegativeAmount(config.baseCostKgLimit);

  if (billableKg <= baseCostKgLimit) {
    return roundShippingFee(baseCost);
  }

  if (methodCode === 'overland_shipping') {
    return roundShippingFee(billableKg * costPerKg);
  }

  return roundShippingFee(
    baseCost + (billableKg - baseCostKgLimit) * costPerKg,
  );
}

/** Weight tier evaluated against Math.ceil(totalWeightKg). */
export type ShippingWeightRule = {
  /** Inclusive max billable kg; null = open-ended tier. */
  maxBillableKg: number | null;
  /** Flat fee for this tier (used when weight is within maxBillableKg). */
  cost?: number;
  /**
   * Full-weight per-kg fee: billableKg * costPerKg.
   * Used for overland when weight > threshold (no baseCost added).
   */
  costPerKg?: number;
  /**
   * Base + extra-kg formula: baseCost + max(0, billableKg - includedKg) * costPerExtraKg.
   * Used for economy when weight exceeds included kg.
   */
  baseCost?: number;
  includedKg?: number;
  costPerExtraKg?: number;
};

export type NationwideShippingMethodConfig = {
  name: string;
  description?: string;
  estimatedDays?: number;
  /** Minimum billable weight in kg (default 1). */
  minBillableKg?: number;
  rules: ShippingWeightRule[];
};

/** Nationwide shipping rates — same for all Pakistani cities/provinces. */
export type ZoneConfigJson = {
  economy_shipping: NationwideShippingMethodConfig;
  overland_shipping: NationwideShippingMethodConfig;
};

export const ZONE_CONFIG_METHOD_CODES = [
  'economy_shipping',
  'overland_shipping',
] as const;

export type ZoneConfigMethodCode = (typeof ZONE_CONFIG_METHOD_CODES)[number];

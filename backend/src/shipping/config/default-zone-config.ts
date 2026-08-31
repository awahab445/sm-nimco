import { ZoneConfigJson } from './zone-config.types';

/**
 * Default nationwide Economy & Overland rates (PKR).
 *
 * Economy:
 *   billable <= 3 → 275
 *   billable > 3  → 275 + (billable - 3) * 76
 *
 * Overland:
 *   billable <= 5 → 342
 *   billable > 5  → billable * 70  (no baseCost)
 */
export const DEFAULT_ZONE_CONFIG: ZoneConfigJson = {
  economy_shipping: {
    name: 'Economy Shipping',
    description: 'Standard nationwide delivery (2 to 4 Days)',
    estimatedDays: 3,
    minBillableKg: 1,
    rules: [
      { maxBillableKg: 3, cost: 275 },
      {
        maxBillableKg: null,
        baseCost: 275,
        includedKg: 3,
        costPerExtraKg: 76,
      },
    ],
  },
  overland_shipping: {
    name: 'Overland Shipping',
    description: 'Express nationwide delivery (4 to 6 Days)',
    estimatedDays: 5,
    minBillableKg: 1,
    rules: [
      { maxBillableKg: 5, cost: 342 },
      // Full billable weight × 70 — do NOT add flat 342 base
      { maxBillableKg: null, costPerKg: 70 },
    ],
  },
};

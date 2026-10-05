import { ZoneConfigJson } from './zone-config.types';

/**
 * Default nationwide Economy & Overland rates (PKR).
 *
 * Outstation (both methods):
 *   billable <= 3 → 300
 *   billable > 3  → 300 + (billable - 3) * 70
 */
export const DEFAULT_ZONE_CONFIG: ZoneConfigJson = {
  economy_shipping: {
    name: 'Economy Shipping',
    description: 'Standard nationwide delivery (2 to 4 Days)',
    estimatedDays: 3,
    minBillableKg: 1,
    rules: [
      { maxBillableKg: 3, cost: 300 },
      {
        maxBillableKg: null,
        baseCost: 300,
        includedKg: 3,
        costPerExtraKg: 70,
      },
    ],
  },
  overland_shipping: {
    name: 'Overland Shipping',
    description: 'Express nationwide delivery (4 to 6 Days)',
    estimatedDays: 5,
    minBillableKg: 1,
    rules: [
      { maxBillableKg: 3, cost: 300 },
      {
        maxBillableKg: null,
        baseCost: 300,
        includedKg: 3,
        costPerExtraKg: 70,
      },
    ],
  },
};

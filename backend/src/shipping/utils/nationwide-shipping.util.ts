import {
  NationwideShippingMethodConfig,
  ShippingWeightRule,
  ZoneConfigJson,
  ZoneConfigMethodCode,
} from '../config/zone-config.types';
import { DEFAULT_ZONE_CONFIG } from '../config/default-zone-config';

export function roundShippingMoney(value: number): number {
  return Math.round(Math.max(0, value) * 100) / 100;
}

/** Billable kg = max(minBillableKg, Math.ceil(actual weight)). */
export function resolveBillableWeightKg(
  totalWeightKg: number,
  minBillableKg = 1,
): number {
  const weight = Math.max(0, totalWeightKg);
  const minKg = Math.max(1, minBillableKg);
  return Math.max(minKg, Math.ceil(weight));
}

/**
 * Resolve cost for a matched weight rule.
 *
 * Priority:
 * 1. base + extra kg: baseCost + max(0, billable - includedKg) * costPerExtraKg
 * 2. flat cost
 * 3. full-weight per kg: billable * costPerKg (no base added)
 */
function costForRule(billableKg: number, rule: ShippingWeightRule): number {
  if (
    rule.baseCost != null &&
    Number.isFinite(rule.baseCost) &&
    rule.costPerExtraKg != null &&
    Number.isFinite(rule.costPerExtraKg)
  ) {
    const included = Math.max(0, rule.includedKg ?? 0);
    const extraKg = Math.max(0, billableKg - included);
    return rule.baseCost + extraKg * rule.costPerExtraKg;
  }

  if (rule.cost != null && Number.isFinite(rule.cost)) {
    return rule.cost;
  }

  if (rule.costPerKg != null && Number.isFinite(rule.costPerKg)) {
    // Full billable weight × rate — intentionally no baseCost
    return billableKg * rule.costPerKg;
  }

  return 0;
}

/**
 * Evaluate weight-tier rules from a nationwide shipping method config
 * (economy_shipping / overland_shipping in zone config).
 */
export function calculateNationwideShippingCost(
  totalWeightKg: number,
  config: NationwideShippingMethodConfig,
): number {
  const billableKg = resolveBillableWeightKg(
    totalWeightKg,
    config.minBillableKg ?? 1,
  );

  for (const rule of config.rules ?? []) {
    if (rule.maxBillableKg == null || billableKg <= rule.maxBillableKg) {
      return roundShippingMoney(costForRule(billableKg, rule));
    }
  }

  return 0;
}

/** Economy shipping — rates from zone config `economy_shipping` rules. */
export function calculateEconomyShippingCost(
  totalWeightKg: number,
  config: NationwideShippingMethodConfig = DEFAULT_ZONE_CONFIG.economy_shipping,
): number {
  return calculateNationwideShippingCost(totalWeightKg, config);
}

/** Overland shipping — rates from zone config `overland_shipping` rules. */
export function calculateOverlandShippingCost(
  totalWeightKg: number,
  config: NationwideShippingMethodConfig = DEFAULT_ZONE_CONFIG.overland_shipping,
): number {
  return calculateNationwideShippingCost(totalWeightKg, config);
}

/** Karachi standard delivery: billable <= 7 kg → 200 PKR; above 7 kg → 250 PKR flat. */
export function calculateKarachiShippingCost(totalWeightKg: number): number {
  const billableWeight = resolveBillableWeightKg(totalWeightKg);
  if (billableWeight <= 7) {
    return roundShippingMoney(200);
  }
  return roundShippingMoney(250);
}

export function buildKarachiShippingOption(
  totalWeightKg: number,
  currency: string,
): {
  methodId: string;
  methodCode: string;
  methodName: string;
  cost: number;
  currency: string;
  estimatedDays?: number;
  description?: string;
} {
  return {
    methodId: 'standard_karachi',
    methodCode: 'standard_karachi',
    methodName: 'Standard Delivery',
    cost: calculateKarachiShippingCost(totalWeightKg),
    currency,
    estimatedDays: 2,
    description: 'Standard delivery (1 to 2 Days)',
  };
}

export function buildNationwideShippingOptions(
  totalWeightKg: number,
  config: ZoneConfigJson,
  currency: string,
): Array<{
  methodId: string;
  methodCode: ZoneConfigMethodCode;
  methodName: string;
  cost: number;
  currency: string;
  estimatedDays?: number;
  description?: string;
}> {
  return (Object.keys(config) as ZoneConfigMethodCode[]).map((code) => {
    const method = config[code];
    const cost = calculateNationwideShippingCost(totalWeightKg, method);

    return {
      methodId: code,
      methodCode: code,
      methodName: method.name,
      cost,
      currency,
      estimatedDays: method.estimatedDays,
      description: method.description,
    };
  });
}

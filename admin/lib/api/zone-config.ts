import { fetchApi as adminFetch } from '../api-client';

export type ShippingWeightRule = {
  maxBillableKg: number | null;
  cost?: number;
  costPerKg?: number;
  baseCost?: number;
  includedKg?: number;
  costPerExtraKg?: number;
};

export type NationwideShippingMethodConfig = {
  name: string;
  description?: string;
  estimatedDays?: number;
  minBillableKg?: number;
  rules: ShippingWeightRule[];
};

export type ZoneConfigJson = {
  economy_shipping: NationwideShippingMethodConfig;
  overland_shipping: NationwideShippingMethodConfig;
};

export async function fetchZoneConfig(): Promise<ZoneConfigJson> {
  return adminFetch<ZoneConfigJson>('/admin/shipping/zone-config');
}

export async function updateZoneConfig(
  config: ZoneConfigJson,
): Promise<ZoneConfigJson> {
  return adminFetch<ZoneConfigJson>('/admin/shipping/zone-config', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

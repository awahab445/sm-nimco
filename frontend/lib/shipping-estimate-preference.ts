/**
 * Persist cart shipping estimate selection so checkout can pre-select
 * Economy / Overland and optionally prefill province/city.
 */

const STORAGE_KEY = 'cart-shipping-estimate';

export type ShippingEstimatePreference = {
  methodCode: string;
  methodId?: string;
  methodName?: string;
  cost?: number;
  currency?: string;
  province?: string;
  city?: string;
  cityId?: string;
  updatedAt: number;
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function getShippingEstimatePreference(): ShippingEstimatePreference | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ShippingEstimatePreference;
    if (!parsed?.methodCode || typeof parsed.methodCode !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setShippingEstimatePreference(
  preference: Omit<ShippingEstimatePreference, 'updatedAt'> & {
    updatedAt?: number;
  },
): void {
  if (!canUseStorage()) return;
  const payload: ShippingEstimatePreference = {
    ...preference,
    updatedAt: preference.updatedAt ?? Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearShippingEstimatePreference(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}

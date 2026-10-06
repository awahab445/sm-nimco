/** Default unit weight (kg) when product/custom weight is missing. */
export const DEFAULT_SHIPPING_WEIGHT_KG = 1;

/** Normalize shipping weight unit to KG or G. */
export function normalizeShippingWeightUnit(unit?: string | null): 'KG' | 'G' {
  const normalized = String(unit ?? 'KG')
    .trim()
    .toUpperCase();
  return normalized === 'G' || normalized === 'GRAM' || normalized === 'GRAMS'
    ? 'G'
    : 'KG';
}

/** Convert a shipping weight value to kilograms. */
export function toShippingWeightKg(
  weight: number,
  unit?: string | null,
): number {
  const value = Number.isFinite(weight) ? Math.max(0, weight) : 0;
  return normalizeShippingWeightUnit(unit) === 'G' ? value / 1000 : value;
}

/**
 * Read unit weight (kg) from order-item metadata for custom/unlisted lines.
 * Looks at weightKg, weight, then shippingWeightKg.
 */
export function customOrderItemUnitWeightKg(metadata: unknown): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }
  const meta = metadata as Record<string, unknown>;
  for (const key of ['weightKg', 'weight', 'shippingWeightKg'] as const) {
    const raw = meta[key];
    const n =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
          ? Number(raw)
          : NaN;
    if (Number.isFinite(n) && n >= 0) {
      return n;
    }
  }
  return null;
}

/** True when the line was booked as a custom/unlisted manual item. */
export function isCustomOrderItemMetadata(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return false;
  }
  return (metadata as Record<string, unknown>).isCustom === true;
}

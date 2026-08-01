/** Normalize shipping weight unit to KG or G. */
export function normalizeShippingWeightUnit(
  unit?: string | null,
): 'KG' | 'G' {
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

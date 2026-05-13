const INTERNAL_ATTRIBUTE_KEYS = new Set([
  'optionValueIds',
  'option_value_ids',
]);

function humanizeAttributeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function formatScalarValue(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function linesFromOptionMap(map: Record<string, unknown>): string[] {
  return Object.entries(map)
    .map(([key, value]) => {
      const formatted = formatScalarValue(value);
      return formatted != null ? `${humanizeAttributeKey(key)}: ${formatted}` : null;
    })
    .filter((line): line is string => line != null);
}

/**
 * Customer-facing variant option labels for cart/checkout (e.g. "Flavour: Strawberry").
 * Uses `optionValues` when present; never shows internal `optionValueIds`.
 */
export function formatVariantAttributes(attrs: Record<string, unknown> | undefined): string[] {
  if (!attrs || typeof attrs !== 'object' || Array.isArray(attrs)) return [];

  const optionValues = attrs.optionValues ?? attrs.option_values;
  if (optionValues && typeof optionValues === 'object' && !Array.isArray(optionValues)) {
    return linesFromOptionMap(optionValues as Record<string, unknown>);
  }

  return Object.entries(attrs)
    .filter(([key]) => !INTERNAL_ATTRIBUTE_KEYS.has(key) && key !== 'optionValues' && key !== 'option_values')
    .map(([key, value]) => {
      const formatted = formatScalarValue(value);
      return formatted != null ? `${humanizeAttributeKey(key)}: ${formatted}` : null;
    })
    .filter((line): line is string => line != null);
}

/**
 * Shipping mass is resolved server-side from admin `shippingWeight` /
 * `shippingWeightUnit` on products and variants. Packing labels (3Ltr, etc.)
 * are display-only and must not drive courier weight.
 */

export function isUuid(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

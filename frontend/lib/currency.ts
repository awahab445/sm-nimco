/**
 * Storefront currency — single source of truth from NEXT_PUBLIC_CURRENCY.
 */

/** ISO 4217 currency code (e.g. PKR, USD). Set via NEXT_PUBLIC_CURRENCY. */
export const APP_CURRENCY =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CURRENCY?.trim()) || 'USD';

/** @deprecated Use APP_CURRENCY */
export const DEFAULT_CURRENCY = APP_CURRENCY;

export function formatPrice(
  value: string | number,
  currency: string = APP_CURRENCY,
): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number.isNaN(n) ? 0 : n);
}

/** Whole-number currency display (e.g. price filter sliders). */
export function formatPriceWhole(
  value: string | number,
  currency: string = APP_CURRENCY,
): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isNaN(n) ? 0 : n);
}

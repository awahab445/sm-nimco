/**
 * Storefront currency — single source of truth from NEXT_PUBLIC_CURRENCY.
 */

/** ISO 4217 currency code (e.g. PKR, USD). Set via NEXT_PUBLIC_CURRENCY. */
export const APP_CURRENCY = (
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CURRENCY?.trim()) ||
  'PKR'
).toUpperCase();

/** @deprecated Use APP_CURRENCY */
export const DEFAULT_CURRENCY = APP_CURRENCY;

function toAmount(value: string | number): number {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Normalize currency for display. Legacy carts/checkouts may still carry USD
 * from older defaults while the store runs in PKR.
 */
export function resolveDisplayCurrency(currency?: string | null): string {
  const code = (currency?.trim() || APP_CURRENCY).toUpperCase();
  if (APP_CURRENCY === 'PKR' && code === 'USD') return 'PKR';
  return code || 'PKR';
}

function formatRs(amount: number, fractionDigits: { min: number; max: number }): string {
  // Explicit fraction digits — Node vs browser ICU disagree on PKR defaults,
  // which causes SSR/client hydration mismatches if left implicit.
  const formatted = amount.toLocaleString('en-PK', {
    minimumFractionDigits: fractionDigits.min,
    maximumFractionDigits: fractionDigits.max,
    useGrouping: true,
  });
  return `Rs. ${formatted}`;
}

export function formatPrice(
  value: string | number,
  currency: string = APP_CURRENCY,
): string {
  const amount = toAmount(value);
  const code = resolveDisplayCurrency(currency);

  if (code === 'PKR') {
    return formatRs(amount, { min: 0, max: 2 });
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Whole-number currency display (e.g. price filter sliders). */
export function formatPriceWhole(
  value: string | number,
  currency: string = APP_CURRENCY,
): string {
  const amount = toAmount(value);
  const code = resolveDisplayCurrency(currency);

  if (code === 'PKR') {
    return formatRs(Math.round(amount), { min: 0, max: 0 });
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Admin panel currency display — defaults to PKR / Rs.
 */

export const APP_CURRENCY = (
  process.env.NEXT_PUBLIC_CURRENCY?.trim() || 'PKR'
).toUpperCase();

function toAmount(value: string | number): number {
  const n = typeof value === 'string' ? parseFloat(String(value)) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function resolveDisplayCurrency(currency?: string | null): string {
  const code = (currency?.trim() || APP_CURRENCY).toUpperCase();
  if (APP_CURRENCY === 'PKR' && code === 'USD') return 'PKR';
  return code || 'PKR';
}

/** Format an amount as Pakistani Rupees (or another ISO currency). */
export function formatPrice(
  value: string | number,
  currency: string = APP_CURRENCY,
): string {
  const amount = toAmount(value);
  const code = resolveDisplayCurrency(currency);

  if (code === 'PKR') {
    return `Rs. ${amount.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    })}`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

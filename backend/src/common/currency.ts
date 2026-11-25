/**
 * Application currency — read from APP_CURRENCY or DEFAULT_CURRENCY env vars.
 * Defaults to PKR for the SM Nimco storefront.
 */
export const APP_CURRENCY = (
  process.env.APP_CURRENCY?.trim() ||
  process.env.DEFAULT_CURRENCY?.trim() ||
  'PKR'
).toUpperCase();

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Coerce Prisma Decimal / string / number into a finite 2-decimal amount.
 * Meta/TikTok reject NaN and treat a repeated 0 as "same price" on Purchase.
 */
export function toMoneyNumber(value: unknown): number {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? roundMoney(value) : 0;
  }
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(/,/g, '').trim());
    return Number.isFinite(n) ? roundMoney(n) : 0;
  }
  if (typeof value === 'object') {
    const obj = value as { toNumber?: () => unknown; toString?: () => string };
    if (typeof obj.toNumber === 'function') {
      const n = Number(obj.toNumber());
      return Number.isFinite(n) ? roundMoney(n) : 0;
    }
    if (typeof obj.toString === 'function') {
      const s = obj.toString();
      if (s && s !== '[object Object]') {
        const n = parseFloat(s.replace(/,/g, ''));
        return Number.isFinite(n) ? roundMoney(n) : 0;
      }
    }
  }
  const n = Number(value);
  return Number.isFinite(n) ? roundMoney(n) : 0;
}

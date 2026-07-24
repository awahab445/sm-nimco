/**
 * Application currency — read from APP_CURRENCY or DEFAULT_CURRENCY env vars.
 * Defaults to PKR for the SM Nimco storefront.
 */
export const APP_CURRENCY = (
  process.env.APP_CURRENCY?.trim() ||
  process.env.DEFAULT_CURRENCY?.trim() ||
  'PKR'
).toUpperCase();

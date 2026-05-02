/**
 * App config from environment.
 * Use NEXT_PUBLIC_* for values needed on the client.
 */

/** Default currency code for display and fallbacks (e.g. PKR, USD). Set via NEXT_PUBLIC_CURRENCY. */
export const DEFAULT_CURRENCY =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_CURRENCY) || 'USD';

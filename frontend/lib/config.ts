/**
 * App config from environment.
 * Use NEXT_PUBLIC_* for values needed on the client.
 */

/** Default currency code for display and fallbacks (e.g. PKR, USD). Set via NEXT_PUBLIC_CURRENCY. */
export const DEFAULT_CURRENCY =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_CURRENCY) || 'USD';

/** Storefront display name (header, footer, logo alt text). */
export const STORE_NAME =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_STORE_NAME?.trim()) || 'Store';

const STORE_THEME_RAW =
  typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_STORE_THEME?.trim().toLowerCase() : '';

/**
 * Public URL for header logo (any theme). Overrides theme default when set.
 * Use a PNG (or SVG) with transparency for the header; JPEG cannot preserve alpha.
 * Example: `/themes/mehfil-shereen/logo.png` or a full CDN URL.
 */
export const STORE_LOGO_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_STORE_LOGO?.trim()) || '';

/** Resolved logo `src` for the header, or null to show the store name as text. */
export function getStoreLogoSrc(): string | null {
  if (STORE_LOGO_URL) return STORE_LOGO_URL;
  if (STORE_THEME_RAW === 'mehfil_shereen') return '/themes/mehfil-shereen/logo.png';
  return null;
}

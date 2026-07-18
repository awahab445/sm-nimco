/**
 * App config from environment.
 * Use NEXT_PUBLIC_* for values needed on the client.
 */

export { APP_CURRENCY, DEFAULT_CURRENCY } from './currency';

/** Storefront display name (header, footer, logo alt text). */
export const STORE_NAME =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_STORE_NAME?.trim()) ||
  'M. ESSA CHEMICALS';

/**
 * Split store name for header wordmark: last word on its own line (mobile),
 * rest on the first line — e.g. "M. ESSA" / "CHEMICALS".
 */
export function splitStoreName(name: string): { lead: string; trail: string | null } {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { lead: 'Store', trail: null };
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace <= 0) return { lead: trimmed, trail: null };
  return {
    lead: trimmed.slice(0, lastSpace),
    trail: trimmed.slice(lastSpace + 1),
  };
}

const STORE_THEME_RAW =
  typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_STORE_THEME?.trim().toLowerCase() : '';

/**
 * Public URL for header logo (any theme). Overrides theme default when set.
 * Use a PNG (or SVG) with transparency for the header; JPEG cannot preserve alpha.
 * Example: `/themes/mehfil-shereen/logo.png` or a full CDN URL.
 */
export const STORE_LOGO_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_STORE_LOGO?.trim()) || '';

/** Resolved logo `src` for the header (`public/logo.png` by default). */
export function getStoreLogoSrc(): string {
  if (STORE_LOGO_URL) return STORE_LOGO_URL;
  if (STORE_THEME_RAW === 'mehfil_shereen') return '/themes/mehfil-shereen/logo.png';
  return '/logo.png';
}

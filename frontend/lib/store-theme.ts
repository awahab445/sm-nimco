/**
 * Storefront visual preset (skin). Controlled by NEXT_PUBLIC_STORE_THEME on the server;
 * the same token layer in styles/store-themes.css drives all colors and radii.
 */
export const STORE_THEME_IDS = [
  'default',
  'ocean',
  'ember',
  'mehfil_shereen',
  'sm_nimco',
] as const;

export type StoreThemeId = (typeof STORE_THEME_IDS)[number];

export function getStoreThemeId(): StoreThemeId {
  const raw = process.env.NEXT_PUBLIC_STORE_THEME?.trim().toLowerCase();
  if (raw && (STORE_THEME_IDS as readonly string[]).includes(raw)) {
    return raw as StoreThemeId;
  }
  return 'default';
}

export const STORE_THEME_IDS = [
  'essa-chemicals',
  'mehfil-e-shireen',
  'ember',
  'tailwind',
  'sm-nimco',
] as const;

export type StoreThemeId = (typeof STORE_THEME_IDS)[number];

const LEGACY_THEME_MAP: Record<string, StoreThemeId> = {
  default: 'tailwind',
  modern: 'tailwind',
  vibrant: 'tailwind',
  mehfil_shereen: 'mehfil-e-shireen',
  'mehfil-e-shireen': 'mehfil-e-shireen',
  ember: 'ember',
  tailwind: 'tailwind',
  'essa-chemicals': 'essa-chemicals',
  essa_chemicals: 'essa-chemicals',
  'sm-nimco': 'sm-nimco',
  sm_nimco: 'sm-nimco',
};

export function isStoreThemeId(value: string): value is StoreThemeId {
  return (STORE_THEME_IDS as readonly string[]).includes(value);
}

export function normalizeStoreThemeId(
  value: string | null | undefined,
): StoreThemeId {
  const raw = value?.trim().toLowerCase() ?? '';
  const mapped = LEGACY_THEME_MAP[raw] ?? raw;
  if (isStoreThemeId(mapped)) {
    return mapped;
  }
  return 'tailwind';
}

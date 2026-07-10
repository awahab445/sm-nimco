export const STORE_THEME_IDS = [
  'mehfil-e-shireen',
  'ember',
  'tailwind',
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

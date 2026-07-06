export const PROVISIONED_THEME_IDS = ['mehfil-e-shireen', 'ember', 'tailwind'] as const;

export type ProvisionedThemeId = (typeof PROVISIONED_THEME_IDS)[number];

const LEGACY_THEME_MAP: Record<string, ProvisionedThemeId> = {
  default: 'tailwind',
  modern: 'tailwind',
  vibrant: 'tailwind',
  mehfil_shereen: 'mehfil-e-shireen',
  'mehfil-e-shireen': 'mehfil-e-shireen',
  ember: 'ember',
  tailwind: 'tailwind',
};

export function isProvisionedThemeId(value: string): value is ProvisionedThemeId {
  return (PROVISIONED_THEME_IDS as readonly string[]).includes(value);
}

export function normalizeProvisionedThemeId(value: string | null | undefined): ProvisionedThemeId {
  const raw = value?.trim().toLowerCase() ?? '';
  const mapped = LEGACY_THEME_MAP[raw] ?? raw;
  if (isProvisionedThemeId(mapped)) {
    return mapped;
  }
  return 'tailwind';
}

export type StoreThemeCode = 'default' | 'ember' | 'mehfil_shereen';

/** Maps admin-provisioned theme id to the internal store-themes.css preset key. */
export function toStoreThemePresetId(theme: ProvisionedThemeId): StoreThemeCode {
  switch (theme) {
    case 'mehfil-e-shireen':
      return 'mehfil_shereen';
    case 'ember':
      return 'ember';
    case 'tailwind':
    default:
      return 'default';
  }
}

export const THEME_PRESETS: Record<
  ProvisionedThemeId,
  {
    label: string;
    description: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    background: string;
  }
> = {
  tailwind: {
    label: 'Tailwind',
    description: 'Fresh blue-and-white household cleaning brand',
    primary: '#4f90f1',
    primaryHover: '#3577d9',
    secondary: '#eef4fe',
    background: '#F5F5F5',
  },
  ember: {
    label: 'Ember',
    description: 'Warm accent for fashion, home, and lifestyle',
    primary: '#c2410c',
    primaryHover: '#9a3412',
    secondary: '#ffedd5',
    background: '#fafaf9',
  },
  'mehfil-e-shireen': {
    label: 'Mehfil-e-Shireen',
    description: 'Gold CTAs with navy anchors and patterned canvas',
    primary: '#b8944a',
    primaryHover: '#9a7a3a',
    secondary: '#141c2c',
    background: '#ffffff',
  },
};

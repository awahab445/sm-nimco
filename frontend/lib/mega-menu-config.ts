import type { CategoryTreeItem } from '@/lib/api-client';

/**
 * Mega menu: optional badges per category slug (extend as needed).
 * Keys are category `slug` values from the API.
 */
export type MegaMenuBadge = 'hot' | 'new';

/**
 * TEMPORARY — set to `false` after verifying the mega menu with real API categories.
 * When `true`, empty API results use `MOCK_MEGA_MENU_CATEGORY_TREE` so the UI always renders for QA.
 */
export const MEGA_MENU_USE_MOCK_CATEGORIES = false;

/** Demo tree for layout / badge testing (slugs are fake — links 404 unless you add matching categories). */
export const MOCK_MEGA_MENU_CATEGORY_TREE: CategoryTreeItem[] = [
  {
    id: '00000000-0000-0000-0000-00000000aa01',
    name: 'Electronics',
    slug: 'demo-electronics',
    position: 0,
    children: [
      { id: '00000000-0000-0000-0000-00000000aa11', name: 'Phones', slug: 'demo-phones', position: 0, parentId: '00000000-0000-0000-0000-00000000aa01' },
      { id: '00000000-0000-0000-0000-00000000aa12', name: 'Laptops', slug: 'demo-laptops', position: 1, parentId: '00000000-0000-0000-0000-00000000aa01' },
    ],
  },
  {
    id: '00000000-0000-0000-0000-00000000aa02',
    name: 'Fashion',
    slug: 'demo-fashion',
    position: 1,
    children: [
      { id: '00000000-0000-0000-0000-00000000aa21', name: 'New in', slug: 'demo-new-in', position: 0, parentId: '00000000-0000-0000-0000-00000000aa02' },
      { id: '00000000-0000-0000-0000-00000000aa22', name: 'Footwear', slug: 'demo-footwear', position: 1, parentId: '00000000-0000-0000-0000-00000000aa02' },
    ],
  },
  {
    id: '00000000-0000-0000-0000-00000000aa03',
    name: 'Home & Living',
    slug: 'demo-home',
    position: 2,
    children: [
      { id: '00000000-0000-0000-0000-00000000aa31', name: 'Kitchen', slug: 'demo-kitchen', position: 0, parentId: '00000000-0000-0000-0000-00000000aa03' },
    ],
  },
  {
    id: '00000000-0000-0000-0000-00000000aa04',
    name: 'Sports',
    slug: 'demo-sports',
    position: 3,
    children: [
      { id: '00000000-0000-0000-0000-00000000aa41', name: 'Outdoor', slug: 'demo-outdoor', position: 0, parentId: '00000000-0000-0000-0000-00000000aa04' },
      { id: '00000000-0000-0000-0000-00000000aa42', name: 'Fitness', slug: 'demo-fitness', position: 1, parentId: '00000000-0000-0000-0000-00000000aa04' },
    ],
  },
];

export const CATEGORY_NAV_BADGES: Record<string, MegaMenuBadge> = {
  'demo-phones': 'hot',
  'demo-new-in': 'new',
  phones: 'hot',
  'fashion-new-in': 'new',
};

export type MegaMenuPromo = {
  imageSrc: string;
  headline: string;
  subline: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Normalize `/categories` responses (array or `{ data: [...] }`). */
export function parseCategoryTreeResponse(res: unknown): CategoryTreeItem[] {
  if (Array.isArray(res)) return res as CategoryTreeItem[];
  if (res && typeof res === 'object' && 'data' in res) {
    const d = (res as { data: unknown }).data;
    if (Array.isArray(d)) return d as CategoryTreeItem[];
  }
  return [];
}

/** Roots passed into mega menu: real API tree, or mock when allowed and API is empty. */
export function getMegaMenuCategoryRoots(apiRoots: CategoryTreeItem[]): CategoryTreeItem[] {
  if (apiRoots.length > 0) return apiRoots;
  if (MEGA_MENU_USE_MOCK_CATEGORIES) return MOCK_MEGA_MENU_CATEGORY_TREE;
  return [];
}

export function getMegaMenuPromo(): MegaMenuPromo {
  const env = typeof process !== 'undefined' ? process.env : undefined;
  return {
    imageSrc:
      env?.NEXT_PUBLIC_MEGA_MENU_PROMO_IMAGE?.trim() ||
      '/themes/mehfil-shereen/banner1.jpeg',
    headline: env?.NEXT_PUBLIC_MEGA_MENU_PROMO_TITLE?.trim() || 'Up to 30% off',
    subline: env?.NEXT_PUBLIC_MEGA_MENU_PROMO_SUBTITLE?.trim() || 'Selected styles this week',
    ctaLabel: env?.NEXT_PUBLIC_MEGA_MENU_PROMO_CTA?.trim() || 'Shop now',
    ctaHref: env?.NEXT_PUBLIC_MEGA_MENU_PROMO_HREF?.trim() || '/products',
  };
}

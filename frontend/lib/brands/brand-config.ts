export type FaqItem = { question: string; answer: string };

/** Local fallback banner — always present under `public/`. */
export const DEFAULT_BANNER_IMAGE = '/placeholder.svg';

export type BrandDefinition = {
  /** URL slug: `/brand/[slug]` */
  slug: string;
  name: string;
  /** Catalog `attributes.brand` values that match this brand (case-insensitive). */
  filterValues: string[];
  tagline: string;
  description: string;
  heroImage: string;
  seoTitle?: string;
  metaDescription?: string;
  faqs: FaqItem[];
  ownBrand?: boolean;
};

/**
 * SM Nimco has no `/brand/[slug]` pages, so no brand landing pages are listed
 * (sitemap and product pages must not link to URLs that 404).
 */
const BRAND_DEFINITIONS: BrandDefinition[] = [];

/**
 * `attributes.brand` values that mean the store's own range. Only an explicit tag
 * counts: an untagged product is never treated as SM Nimco-made.
 */
const OWN_BRAND_NAMES = ['SM Nimco', 'SM Nimco & Sweets'];

const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '');

export function listBrands(): BrandDefinition[] {
  return BRAND_DEFINITIONS;
}

export function getBrandBySlug(slug: string): BrandDefinition | null {
  const clean = slug.trim().toLowerCase();
  return BRAND_DEFINITIONS.find((b) => b.slug === clean) ?? null;
}

/** Brand landing match from product text; null while SM Nimco has no brand pages. */
export function matchBrandFromProduct(input: {
  name?: string | null;
  sku?: string | null;
  attributes?: Record<string, unknown> | null;
}): BrandDefinition | null {
  const haystack = norm(
    `${String(input.attributes?.brand ?? input.attributes?.Brand ?? '')} ${input.name ?? ''} ${input.sku ?? ''}`,
  );
  if (!haystack) return null;
  return (
    BRAND_DEFINITIONS.find((b) =>
      b.filterValues.some((v) => norm(v).length >= 3 && haystack.includes(norm(v))),
    ) ?? null
  );
}

/** True only when a catalog `attributes.brand` value explicitly names SM Nimco. */
export function isOwnBrandName(value?: string | null): boolean {
  const brand = norm(value ?? '');
  if (!brand) return false;
  return OWN_BRAND_NAMES.some((v) => norm(v) === brand);
}

export function brandHref(slug: string): string {
  return `/brand/${encodeURIComponent(slug.trim())}`;
}

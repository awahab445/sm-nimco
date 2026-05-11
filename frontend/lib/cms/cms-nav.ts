export type CmsStorefrontNavPage = {
  title: string;
  slug: string;
};

/** Slugs that map to app routes; exclude from CMS-only nav links. */
export const STOREFRONT_RESERVED_SLUGS = new Set(
  [
    'account',
    'addresses',
    'api',
    'cart',
    'categories',
    'checkout',
    'create-password',
    'login',
    'logout',
    'orders',
    'pages',
    'products',
    'profile',
    'register',
    'track-order',
  ].map((s) => s.toLowerCase()),
);

export function filterNavCmsPages(pages: CmsStorefrontNavPage[]): CmsStorefrontNavPage[] {
  return pages.filter((p) => p.slug?.trim() && !STOREFRONT_RESERVED_SLUGS.has(p.slug.trim().toLowerCase()));
}

export function cmsPageHref(slug: string): string {
  const s = slug.trim();
  if (!s) return '/';
  return `/${encodeURIComponent(s)}`;
}

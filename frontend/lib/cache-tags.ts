/** Shared Next.js cache tags for on-demand revalidation after deploys / CMS updates. */
export const CACHE_TAGS = {
  storefront: 'storefront',
  home: 'home',
  cms: 'cms',
  catalog: 'catalog',
  theme: 'theme',
  analytics: 'analytics',
  deals: 'deals',
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/** All tags flushed on a full storefront deploy. */
export const DEPLOY_CACHE_TAGS: CacheTag[] = Object.values(CACHE_TAGS);

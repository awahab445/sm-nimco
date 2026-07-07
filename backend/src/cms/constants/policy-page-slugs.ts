export const POLICY_PAGE_SLUGS = [
  'shipping-returns',
  'privacy-policy',
  'terms-conditions',
] as const;

export type PolicyPageSlug = (typeof POLICY_PAGE_SLUGS)[number];

export function isPolicyPageSlug(slug: string): slug is PolicyPageSlug {
  return (POLICY_PAGE_SLUGS as readonly string[]).includes(slug);
}

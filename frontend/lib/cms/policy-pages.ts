export const POLICY_PAGE_SLUGS = [
  'shipping-returns',
  'privacy-policy',
  'terms-conditions',
] as const;

export type PolicyPageSlug = (typeof POLICY_PAGE_SLUGS)[number];

export type PolicyPageContent = {
  title: string;
  slug: PolicyPageSlug;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contentHtml: string;
  updatedAt?: string;
};

export const POLICY_PAGE_DEFAULTS: Record<PolicyPageSlug, PolicyPageContent> = {
  'shipping-returns': {
    slug: 'shipping-returns',
    title: 'Shipping & Returns',
    excerpt: 'Delivery timelines, shipping rates, and return policy.',
    metaTitle: 'Shipping & Returns',
    metaDescription: 'Learn about shipping options, delivery times, and how to return items.',
    contentHtml:
      '<p>We process orders within 1–2 business days. Standard delivery typically arrives within 3–7 business days depending on your location.</p><p>If you receive a damaged or incorrect item, contact us within 7 days of delivery with your order number. Approved returns are refunded or replaced according to our customer care review.</p>',
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    excerpt: 'How we collect, use, and protect your personal information.',
    metaTitle: 'Privacy Policy',
    metaDescription: 'Read how we handle your data, cookies, and account information.',
    contentHtml:
      '<p>We collect information you provide when creating an account, placing an order, or contacting support — such as your name, email, phone number, and delivery address.</p><p>We use your information to process orders, provide customer support, and send transactional messages related to your purchases.</p>',
  },
  'terms-conditions': {
    slug: 'terms-conditions',
    title: 'Terms & Conditions',
    excerpt: 'Terms governing use of our website and purchases.',
    metaTitle: 'Terms & Conditions',
    metaDescription: 'Store terms of use, ordering rules, and limitations of liability.',
    contentHtml:
      '<p>By browsing or purchasing from this website, you agree to these terms. You must provide accurate information when creating an account or placing an order.</p><p>All prices are shown in the store currency unless stated otherwise. We reserve the right to correct pricing errors before fulfillment.</p>',
  },
};

export function isPolicyPageSlug(slug: string): slug is PolicyPageSlug {
  return (POLICY_PAGE_SLUGS as readonly string[]).includes(slug);
}

export function policyPageHref(slug: PolicyPageSlug): string {
  return `/${slug}`;
}

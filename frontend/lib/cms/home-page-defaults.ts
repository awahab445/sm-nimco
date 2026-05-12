import type { HomeSection } from './home-page-types';

/**
 * Fallback layout when no API is configured — replace via `getHomePageSections`.
 *
 * Hero `imageUrl`: full image is shown (no overlay). Use a wide landscape file, e.g.
 * **2400×1000** (2.4∶1) or **1920×800** — any aspect ratio works; export at 2× width for sharp displays.
 */
export const HOME_PAGE_DEFAULT_SECTIONS: HomeSection[] = [
  {
    id: 'hero-main',
    type: 'hero_slider',
    autoplayMs: 6500,
    slides: [
      {
        id: '1',
        title: 'Curated for how you shop today',
        subtitle: 'Quality essentials, fair prices, delivered with care.',
        imageUrl: '/themes/mehfil-shereen/banner1.jpeg',
        ctaLabel: 'Shop now',
        ctaHref: '/products',
      },
      {
        id: '2',
        title: 'New arrivals every week',
        subtitle: 'Discover fresh picks across categories you love.',
        ctaLabel: 'Browse products',
        ctaHref: '/products',
      },
      {
        id: '3',
        title: 'Track any order, anytime',
        subtitle: 'Use your email and order number — no login required.',
        ctaLabel: 'Track order',
        ctaHref: '/track-order',
      },
    ],
  },
  {
    id: 'trust',
    type: 'trust_badges',
    items: [
      {
        id: 't1',
        title: 'Secure checkout',
        description: 'Encrypted payments and trusted providers.',
      },
      {
        id: 't2',
        title: 'Fast dispatch',
        description: 'Orders processed quickly from our network.',
      },
      {
        id: 't3',
        title: 'Easy returns',
        description: 'Simple policies — we are here to help.',
      },
      {
        id: 't4',
        title: 'Real support',
        description: 'Reach our team when you need answers.',
      },
    ],
  },
  {
    id: 'categories',
    type: 'category_tiles',
    title: 'Shop by category',
    subtitle: 'Layered navigation and filters on listing pages help you narrow down fast.',
    limit: 8,
  },
  {
    id: 'shelf-featured',
    type: 'product_shelf',
    title: 'Featured picks',
    subtitle: 'Popular right now',
    viewAllHref: '/products',
    source: { kind: 'latest', limit: 8 },
  },
  {
    id: 'promo-mid',
    type: 'promo_banner',
    tone: 'primary',
    title: 'Members save more on bundles',
    subtitle: 'Sign in for exclusive offers — account features coming soon.',
    ctaLabel: 'Create account',
    ctaHref: '/register',
  },
  {
    id: 'shelf-secondary',
    type: 'product_shelf',
    title: 'More to explore',
    subtitle: 'Another page of new arrivals',
    viewAllHref: '/products?page=2',
    source: { kind: 'latest', limit: 4, page: 2 },
  },
  {
    id: 'subscription',
    type: 'subscription_cta',
    title: 'Stay in the loop',
    subtitle: 'Get product drops and offers by email.',
  },
];

import type { HomeSection } from './home-page-types';

/** Email signup block appended to the homepage when CMS layout omits it. */
export const HOME_SUBSCRIPTION_SECTION: HomeSection = {
  id: 'subscription',
  type: 'subscription_cta',
  title: 'Stay in the loop',
  subtitle: 'Subscribe for new arrivals, offers, and store news.',
};

/**
 * Fallback layout when no API is configured — replace via `getHomePageSections`.
 *
 * Section rhythm mirrors Kalles demo-home: full-bleed hero → banner mosaic →
 * category tiles → product shelf → promo row → second shelf → trust → newsletter.
 *
 * Hero `imageUrl`: immersive full-viewport cover (object-cover). Prefer wide landscape
 * files (e.g. **1920×1080** or **2400×1350**); export at 2× width for sharp displays.
 */
export const HOME_PAGE_DEFAULT_SECTIONS: HomeSection[] = [
  {
    id: 'hero-main',
    type: 'hero_slider',
    autoplayMs: 7000,
    slides: [
      {
        id: '1',
        title: 'Summer essentials, elevated',
        subtitle: 'New season picks for everyday style.',
        imageUrl: '/themes/mehfil-shereen/banner1.jpeg',
        ctaLabel: 'Shop now',
        ctaHref: '/products',
        textAlign: 'left',
        textPosition: 'middle',
        textColor: 'light',
      },
      {
        id: '2',
        title: 'Fresh arrivals every week',
        subtitle: 'Discover the latest across every category.',
        imageUrl: '/themes/mehfil-shereen/texture.png',
        ctaLabel: 'Browse products',
        ctaHref: '/products',
        textAlign: 'center',
        textPosition: 'middle',
        textColor: 'light',
      },
      {
        id: '3',
        title: 'Track any order, anytime',
        subtitle: 'Email and order number — no login required.',
        ctaLabel: 'Track order',
        ctaHref: '/track-order',
        textAlign: 'left',
        textPosition: 'middle',
        textColor: 'dark',
      },
    ],
  },
  {
    id: 'promo-mosaic-a',
    type: 'promo_banner',
    eyebrow: 'Nutrition',
    title: 'For life',
    backgroundColor: '#d4efe3',
    productImageUrl: '/themes/mehfil-shereen/banner1.jpeg',
    ctaLabel: 'Shop now',
    ctaHref: '/products',
    textAlign: 'left',
    buttonStyle: 'primary',
  },
  {
    id: 'promo-mosaic-b',
    type: 'promo_banner',
    eyebrow: 'Lookbook 2021',
    title: 'Make love this look',
    imageUrl: '/themes/mehfil-shereen/texture.png',
    textAlign: 'center',
  },
  {
    id: 'promo-mosaic-c',
    type: 'promo_banner',
    eyebrow: 'Vitamin',
    title: 'For children',
    subtitle: 'Up to 50% off',
    backgroundColor: '#f5e9b8',
    productImageUrl: '/themes/mehfil-shereen/banner1.jpeg',
    ctaLabel: 'Shop now',
    ctaHref: '/products',
    textAlign: 'left',
    buttonStyle: 'secondary',
  },
  {
    id: 'categories',
    type: 'category_tiles',
    title: 'Shop by category',
    subtitle: 'Collections',
    limit: 8,
  },
  {
    id: 'shelf-featured',
    type: 'product_shelf',
    title: 'Featured products',
    subtitle: 'Bestsellers',
    viewAllHref: '/products',
    source: { kind: 'latest', limit: 8 },
  },
  {
    id: 'promo-mid',
    type: 'promo_banner',
    tone: 'primary',
    title: 'Lookbook inspiration',
    subtitle: 'Style ideas from this season’s edit.',
    ctaLabel: 'Explore',
    ctaHref: '/products',
    imageUrl: '/themes/mehfil-shereen/texture.png',
  },
  {
    id: 'promo-mid-secondary',
    type: 'promo_banner',
    tone: 'muted',
    title: 'Everyday essentials',
    subtitle: 'Quality basics at fair prices.',
    ctaLabel: 'Shop essentials',
    ctaHref: '/products',
    imageUrl: '/themes/mehfil-shereen/banner1.jpeg',
  },
  {
    id: 'shelf-secondary',
    type: 'product_shelf',
    title: 'More to explore',
    subtitle: 'New arrivals',
    viewAllHref: '/products?page=2',
    source: { kind: 'latest', limit: 8, page: 2 },
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
  HOME_SUBSCRIPTION_SECTION,
];

/**
 * Homepage layout blocks — designed to match a future CMS / storefront API payload.
 * Backend can return `{ sections: HomeSection[] }` with the same discriminated `type` field.
 */

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  /** Optional image URL (CMS or CDN). Falls back to gradient if missing. */
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface TrustBadgeItem {
  id: string;
  title: string;
  description: string;
}

export type ProductShelfSource =
  | { kind: 'latest'; limit: number; page?: number }
  | { kind: 'category'; categoryId: string; limit: number; page?: number };

export type HomeSection =
  | {
      id: string;
      type: 'hero_slider';
      slides: HeroSlide[];
      /** Auto-advance; omit or 0 to disable */
      autoplayMs?: number;
    }
  | {
      id: string;
      type: 'trust_badges';
      items: TrustBadgeItem[];
    }
  | {
      id: string;
      type: 'category_tiles';
      title: string;
      subtitle?: string;
      /** Max categories to show (API provides the rest) */
      limit?: number;
    }
  | {
      id: string;
      type: 'product_shelf';
      title: string;
      subtitle?: string;
      viewAllHref: string;
      source: ProductShelfSource;
    }
  | {
      id: string;
      type: 'promo_banner';
      title: string;
      subtitle?: string;
      ctaLabel?: string;
      ctaHref?: string;
      imageUrl?: string;
      tone?: 'primary' | 'muted';
    }
  | {
      id: string;
      type: 'newsletter_cta';
      title: string;
      subtitle?: string;
    };

export interface HomePageLayoutResponse {
  sections: HomeSection[];
}

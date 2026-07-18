/**
 * Homepage layout blocks — designed to match a future CMS / storefront API payload.
 * Backend can return `{ sections: HomeSection[] }` with the same discriminated `type` field.
 */

/** Horizontal text overlay alignment on hero banner images. */
export type HeroSlideTextAlign = 'left' | 'center' | 'right';

/** Vertical text overlay position on hero banner images. */
export type HeroSlideTextPosition = 'top' | 'middle' | 'bottom';

/** Overlay contrast for light vs dark banner photography. */
export type HeroSlideTextColor = 'light' | 'dark';

export interface HeroSlide {
  id: string;
  /** Headline; omit or empty for image-only slides. */
  title?: string;
  subtitle?: string;
  /** Optional image URL (CMS or CDN). Falls back to gradient if missing. */
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Horizontal alignment of overlay copy (default: left). */
  textAlign?: HeroSlideTextAlign;
  /** Vertical position of overlay copy (default: middle). */
  textPosition?: HeroSlideTextPosition;
  /** Text contrast on the banner: light = white, dark = charcoal (default: light). */
  textColor?: HeroSlideTextColor;
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
      /** Pixel width for all slides (from CMS slider); optional, full width if omitted */
      slideWidthPx?: number;
      /** Pixel height for all slides; optional (with width fixes hero aspect) */
      slideHeightPx?: number;
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
      /** Large heading (Kalles title). */
      title: string;
      /** Small caps line above the title (Kalles eyebrow / subheading). */
      eyebrow?: string;
      /** Optional supporting line under the title. */
      subtitle?: string;
      ctaLabel?: string;
      ctaHref?: string;
      /** Full-bleed background photograph. */
      imageUrl?: string;
      /** Solid CSS background when not using (or under) a photo — e.g. `#c8e6d4`. */
      backgroundColor?: string;
      /** Optional product cutout / still-life image layered on the banner. */
      productImageUrl?: string;
      /** Text + CTA alignment (default: left). */
      textAlign?: 'left' | 'center' | 'right';
      /** Flat CTA color: primary = brand/dark, secondary = accent. */
      buttonStyle?: 'primary' | 'secondary';
      /** Legacy solid fill when `backgroundColor` / `imageUrl` omitted. */
      tone?: 'primary' | 'muted';
    }
  | {
      id: string;
      /** @deprecated use `subscription_cta` */
      type: 'newsletter_cta';
      title: string;
      subtitle?: string;
    }
  | {
      id: string;
      type: 'subscription_cta';
      title: string;
      subtitle?: string;
    }
  /**
   * Embed another CMS block by its `identifier` (Admin → CMS → Blocks).
   * Stored in the `home-page-layout` block JSON; resolved server-side before render.
   */
  | {
      id: string;
      type: 'cms_block_ref';
      blockIdentifier: string;
    }
  /** Resolved from `cms_block_ref` after loading `/cms/blocks/:identifier`. */
  | {
      id: string;
      type: 'cms_block';
      blockIdentifier: string;
      contentHtml?: string | null;
      contentJson?: unknown;
    };

export interface HomePageLayoutResponse {
  sections: HomeSection[];
}

'use client';

import type { HomeSection } from '@/lib/cms/home-page-types';
import { HeroSlider, type HeroSliderLayout } from './sections/hero-slider';
import { TrustBadgesSection } from './sections/trust-badges-section';
import { CategoryTilesSection } from './sections/category-tiles-section';
import { ProductShelfSection } from './sections/product-shelf-section';
import { PromoBannerSection } from './sections/promo-banner-section';
import { NewsletterSection } from './sections/newsletter-section';

export function HomeSectionRenderer({
  section,
  heroLayout = 'card',
}: {
  section: HomeSection;
  /** Only applies when `section.type === 'hero_slider'`. */
  heroLayout?: HeroSliderLayout;
}) {
  switch (section.type) {
    case 'hero_slider':
      return (
        <HeroSlider
          slides={section.slides}
          autoplayMs={section.autoplayMs}
          layout={heroLayout}
        />
      );
    case 'trust_badges':
      return <TrustBadgesSection items={section.items} />;
    case 'category_tiles':
      return (
        <CategoryTilesSection
          title={section.title}
          subtitle={section.subtitle}
          limit={section.limit}
        />
      );
    case 'product_shelf':
      return (
        <ProductShelfSection
          title={section.title}
          subtitle={section.subtitle}
          viewAllHref={section.viewAllHref}
          source={section.source}
        />
      );
    case 'promo_banner':
      return (
        <PromoBannerSection
          title={section.title}
          subtitle={section.subtitle}
          ctaLabel={section.ctaLabel}
          ctaHref={section.ctaHref}
          imageUrl={section.imageUrl}
          tone={section.tone}
        />
      );
    case 'newsletter_cta':
      return <NewsletterSection title={section.title} subtitle={section.subtitle} />;
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}

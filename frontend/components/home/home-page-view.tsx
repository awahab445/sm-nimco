import Link from 'next/link';
import type { HomeSection } from '@/lib/cms/home-page-types';
import { Reveal } from '@/components/ui/reveal';
import { HomeSectionRenderer } from './home-section-renderer';
import { PromoBannerSection } from './sections/promo-banner-section';
import { DealCard } from '@/components/deals/deal-card';
import type { StorefrontBundleDeal } from '@/lib/deals/deals.server';
import type { Category, CategoryTreeItem } from '@/lib/api-client';

interface HomePageViewProps {
  sections: HomeSection[];
  /** Optional pre-fetched categories for the Featured Categories grid. */
  categories?: Category[] | CategoryTreeItem[];
  /** Active bundle deals; up to 3 are shown under the categories. */
  deals?: StorefrontBundleDeal[];
}

type PromoBannerSectionData = Extract<HomeSection, { type: 'promo_banner' }>;

type HomeRenderGroup =
  | { kind: 'single'; section: HomeSection }
  | { kind: 'promo_mosaic'; sections: PromoBannerSectionData[] };

function isFullBleedSection(section: HomeSection): boolean {
  return section.type === 'subscription_cta' || section.type === 'newsletter_cta';
}

/** Group consecutive promo_banner blocks into a Kalles-style mosaic row. */
function groupHomeSections(sections: HomeSection[]): HomeRenderGroup[] {
  const groups: HomeRenderGroup[] = [];
  let i = 0;
  while (i < sections.length) {
    const section = sections[i];
    if (section.type === 'promo_banner') {
      const mosaic: PromoBannerSectionData[] = [section];
      while (i + 1 < sections.length && sections[i + 1].type === 'promo_banner') {
        i += 1;
        mosaic.push(sections[i] as PromoBannerSectionData);
      }
      if (mosaic.length > 1) {
        groups.push({ kind: 'promo_mosaic', sections: mosaic });
      } else {
        groups.push({ kind: 'single', section: mosaic[0] });
      }
    } else {
      groups.push({ kind: 'single', section });
    }
    i += 1;
  }
  return groups;
}

function mosaicGridClass(count: number): string {
  /* Kalles banners: 1-col on mobile, equal columns from md, small gutters */
  if (count >= 3) {
    return 'grid grid-cols-1 gap-2 sm:gap-2.5 md:grid-cols-3';
  }
  return 'grid grid-cols-1 gap-2 sm:gap-2.5 md:grid-cols-2';
}

/**
 * Server-rendered homepage layout. Only interactive islands (hero carousel,
 * product cards, subscription form) hydrate on the client.
 *
 * Rhythm: immersive hero → full-width mosaic/newsletter bands → constrained shelves.
 */
export function HomePageView({ sections, categories, deals = [] }: HomePageViewProps) {
  const first = sections[0];
  const useImmersiveLead = first?.type === 'hero_slider' && first.slides.length > 0;
  const bodySections = useImmersiveLead ? sections.slice(1) : sections;
  const groups = groupHomeSections(bodySections);

  const heroHasTitle =
    first?.type === 'hero_slider' &&
    first.slides.some((slide) => Boolean(slide.title?.trim()));
  const featuredCategories = (
    <Reveal
      variant="slide-in"
      data-home-section="featured_categories"
      className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14"
    >
      <CategoryBlocks
        categories={categories}
        title={
          heroHasTitle ? 'Featured categories' : 'Household cleaning products in Pakistan'
        }
        headingLevel={heroHasTitle ? 'h2' : 'h1'}
      />
    </Reveal>
  );

  // Featured deals first; bundles are the higher-value orders, so surface them on the homepage.
  const homeDeals = [...deals].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, 3);
  const dealsSection =
    homeDeals.length > 0 ? (
      <Reveal
        variant="slide-in"
        data-home-section="bundle_deals"
        className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Bundle deals
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Save more when you buy cleaners together.
            </p>
          </div>
          <Link href="/deals" className="text-sm font-medium text-foreground underline underline-offset-4">
            View all deals
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homeDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </Reveal>
    ) : null;

  return (
    <div className="min-w-0 bg-background">
      {useImmersiveLead && (
        <div
          className="home-hero-lead w-full"
          data-home-section={first.type}
          data-home-hero="immersive"
          id={`section-${first.id}`}
        >
          {/* Sync transparent header before paint on full page loads */}
          <script
            dangerouslySetInnerHTML={{
              __html: `document.documentElement.setAttribute('data-immersive-hero','true');`,
            }}
          />
          <HomeSectionRenderer section={first} heroLayout="immersive" />
        </div>
      )}

      {/* Featured Categories — directly under the hero, above Featured picks / shelves */}
      {useImmersiveLead ? featuredCategories : null}
      {useImmersiveLead ? dealsSection : null}

      <div className="flex flex-col">
        {!useImmersiveLead ? featuredCategories : null}
        {!useImmersiveLead ? dealsSection : null}

        {groups.map((group) => {
          if (group.kind === 'promo_mosaic') {
            const ids = group.sections.map((s) => s.id).join('-');
            return (
              <div
                key={`promo-mosaic-${ids}`}
                data-home-section="promo_mosaic"
                className="promo-mosaic w-full px-3 py-5 sm:px-5 sm:py-7 lg:px-6 lg:py-8"
              >
                <div className={`mx-auto max-w-[100rem] ${mosaicGridClass(group.sections.length)}`}>
                  {group.sections.map((section, index) => (
                    <Reveal
                      key={section.id}
                      id={`section-${section.id}`}
                      data-home-section={section.type}
                      variant="slide-in"
                      timeline
                      order={index}
                      className="h-full min-h-0"
                    >
                      <PromoBannerSection
                        title={section.title}
                        eyebrow={section.eyebrow}
                        subtitle={section.subtitle}
                        ctaLabel={section.ctaLabel}
                        ctaHref={section.ctaHref}
                        imageUrl={section.imageUrl}
                        backgroundColor={section.backgroundColor}
                        productImageUrl={section.productImageUrl}
                        textAlign={section.textAlign}
                        buttonStyle={section.buttonStyle}
                        tone={section.tone}
                        mosaic
                      />
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          }

          const { section } = group;
          if (isFullBleedSection(section)) {
            return (
              <Reveal
                key={section.id}
                data-home-section={section.type}
                id={`section-${section.id}`}
                variant="slide-in"
                className="w-full"
              >
                <HomeSectionRenderer section={section} />
              </Reveal>
            );
          }

          return (
            <Reveal
              key={section.id}
              data-home-section={section.type}
              id={`section-${section.id}`}
              variant="slide-in"
              className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14"
            >
              <HomeSectionRenderer section={section} />
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

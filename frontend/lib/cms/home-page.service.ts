import { fetchApi } from '@/lib/api-client';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import type { HomePageLayoutResponse, HomeSection } from './home-page-types';
import { HOME_PAGE_DEFAULT_SECTIONS, HOME_SUBSCRIPTION_SECTION } from './home-page-defaults';

function normalizeSections(raw: unknown): HomeSection[] | null {
  if (!raw || typeof raw !== 'object') return null;
  const sections = (raw as HomePageLayoutResponse).sections;
  if (!Array.isArray(sections) || sections.length === 0) return null;
  return sections as HomeSection[];
}

type CmsBlockApiRow = {
  identifier?: string;
  contentHtml?: string | null;
  contentJson?: unknown;
};

async function resolveCmsBlockRefs(sections: HomeSection[]): Promise<HomeSection[]> {
  const resolved: HomeSection[] = [];

  for (const section of sections) {
    if (section.type !== 'cms_block_ref') {
      resolved.push(section);
      continue;
    }

    const { id, blockIdentifier } = section;
    try {
      const block = await fetchApi<CmsBlockApiRow>(
        `/cms/blocks/${encodeURIComponent(blockIdentifier)}`,
        { cache: 'no-store' },
      );
      const html = block.contentHtml?.trim();
      if (!html) continue;
      resolved.push({
        id,
        type: 'cms_block',
        blockIdentifier,
        contentHtml: html,
        contentJson: block.contentJson,
      });
    } catch {
      /* inactive, missing, or network error — omit slot */
    }
  }

  return resolved;
}

/** Ensure email subscription CTA is on the homepage (CMS layouts often omit it). */
function ensureHomeSubscriptionSection(sections: HomeSection[]): HomeSection[] {
  if (sections.some((s) => s.type === 'subscription_cta' || s.type === 'newsletter_cta')) {
    return sections;
  }
  return [...sections, HOME_SUBSCRIPTION_SECTION];
}

/**
 * Load homepage block layout.
 *
 * Which CMS block is loaded (all paths are relative to `NEXT_PUBLIC_API_URL`):
 * 1. `NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_PATH` — e.g. `/cms/blocks/my-layout`
 * 2. Else `NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_IDENTIFIER` — block slug only, e.g. `my-layout` → `/cms/blocks/my-layout`
 * 3. Else `/cms/blocks/home-page-layout` (seed default)
 *
 * If the fetch fails or `contentJson.sections` is missing/empty, the storefront falls back to `home-page-defaults.ts`.
 *
 * Reusable CMS blocks: include `{ "type": "cms_block_ref", "id": "…", "blockIdentifier": "my-block" }` in `sections`.
 * Each ref is resolved via `GET /cms/blocks/:identifier` and rendered as HTML (see Admin → CMS → Blocks).
 */
export async function getHomePageSections(): Promise<HomeSection[]> {
  const layoutPath = process.env.NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_PATH?.trim();
  const layoutId = process.env.NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_IDENTIFIER?.trim();
  const path =
    layoutPath ||
    (layoutId ? `/cms/blocks/${encodeURIComponent(layoutId)}` : '') ||
    '/cms/blocks/home-page-layout';
  const sliderPath =
    process.env.NEXT_PUBLIC_STOREFRONT_HERO_SLIDER_PATH?.trim() ||
    '/cms/sliders/home-hero';

  const withLiveHeroSlides = async (sections: HomeSection[]): Promise<HomeSection[]> => {
    try {
      const slider = await fetchApi<{
        autoplayMs?: number | null;
        slideWidthPx?: number | null;
        slideHeightPx?: number | null;
        slides?: Array<{
          id: string;
          title: string;
          subtitle?: string | null;
          imageUrl?: string | null;
          ctaLabel?: string | null;
          ctaHref?: string | null;
        }>;
      }>(sliderPath, { cache: 'no-store' });

      const slides = (slider.slides ?? [])
        .map((s) => ({
          id: s.id,
          title: s.title?.trim() || 'Promotion',
          subtitle: s.subtitle ?? undefined,
          imageUrl: resolveImageUrl(s.imageUrl ?? undefined),
          ctaLabel: s.ctaLabel ?? undefined,
          ctaHref: s.ctaHref ?? undefined,
        }))
        .filter((s) => !!s.id && !!s.imageUrl);

      if (slides.length === 0) return sections;

      const heroIndex = sections.findIndex((section) => section.type === 'hero_slider');
      const prevHero = heroIndex >= 0 && sections[heroIndex].type === 'hero_slider' ? sections[heroIndex] : null;
      const heroSection: HomeSection = {
        id: heroIndex >= 0 ? sections[heroIndex].id : 'hero-main',
        type: 'hero_slider',
        autoplayMs: slider.autoplayMs ?? prevHero?.autoplayMs,
        slideWidthPx:
          slider.slideWidthPx != null && slider.slideWidthPx > 0
            ? slider.slideWidthPx
            : prevHero?.slideWidthPx,
        slideHeightPx:
          slider.slideHeightPx != null && slider.slideHeightPx > 0
            ? slider.slideHeightPx
            : prevHero?.slideHeightPx,
        slides,
      };

      if (heroIndex >= 0) {
        return sections.map((section, idx) => (idx === heroIndex ? heroSection : section));
      }
      return [heroSection, ...sections];
    } catch {
      return sections;
    }
  };

  try {
    const data = await fetchApi<
      | HomePageLayoutResponse
      | { data?: HomePageLayoutResponse }
      | { contentJson?: { sections?: HomeSection[] } }
    >(path, { cache: 'no-store' });
    const payload =
      'contentJson' in data && data.contentJson
        ? { sections: data.contentJson.sections ?? [] }
        : 'data' in data && data.data
          ? data.data
          : (data as HomePageLayoutResponse);
    const sections = normalizeSections(payload);
    if (sections) {
      const withBlocks = await resolveCmsBlockRefs(sections);
      return ensureHomeSubscriptionSection(await withLiveHeroSlides(withBlocks));
    }
  } catch {
    // Network or 404 — use defaults in dev / when CMS not deployed
  }

  const defaultsResolved = await resolveCmsBlockRefs(HOME_PAGE_DEFAULT_SECTIONS);
  return ensureHomeSubscriptionSection(await withLiveHeroSlides(defaultsResolved));
}

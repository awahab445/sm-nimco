import { fetchApi } from '@/lib/api-client';
import type { HomePageLayoutResponse, HomeSection } from './home-page-types';
import { HOME_PAGE_DEFAULT_SECTIONS } from './home-page-defaults';

function normalizeSections(raw: unknown): HomeSection[] | null {
  if (!raw || typeof raw !== 'object') return null;
  const sections = (raw as HomePageLayoutResponse).sections;
  if (!Array.isArray(sections) || sections.length === 0) return null;
  return sections as HomeSection[];
}

/**
 * Load homepage block layout.
 *
 * Priority:
 * 1. `NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_PATH` — relative to `NEXT_PUBLIC_API_URL`, e.g. `/storefront/home-layout`
 * 2. Fallback: static defaults (editable in `home-page-defaults.ts`)
 *
 * When the backend exposes a real endpoint, return JSON: `{ "sections": [ ... ] }` using the types in `home-page-types.ts`.
 */
export async function getHomePageSections(): Promise<HomeSection[]> {
  const path =
    process.env.NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_PATH?.trim() ||
    '/cms/blocks/home-page-layout';
  const sliderPath =
    process.env.NEXT_PUBLIC_STOREFRONT_HERO_SLIDER_PATH?.trim() ||
    '/cms/sliders/home-hero';

  const withLiveHeroSlides = async (sections: HomeSection[]): Promise<HomeSection[]> => {
    try {
      const slider = await fetchApi<{
        autoplayMs?: number | null;
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
        .filter((s) => !!s.id && !!s.title)
        .map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle ?? undefined,
          imageUrl: s.imageUrl ?? undefined,
          ctaLabel: s.ctaLabel ?? undefined,
          ctaHref: s.ctaHref ?? undefined,
        }));

      if (slides.length === 0) return sections;

      const heroIndex = sections.findIndex((section) => section.type === 'hero_slider');
      const heroSection: HomeSection = {
        id: heroIndex >= 0 ? sections[heroIndex].id : 'hero-main',
        type: 'hero_slider',
        autoplayMs: slider.autoplayMs ?? (heroIndex >= 0 && sections[heroIndex].type === 'hero_slider' ? sections[heroIndex].autoplayMs : undefined),
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
    if (sections) return withLiveHeroSlides(sections);
  } catch {
    // Network or 404 — use defaults in dev / when CMS not deployed
  }

  return withLiveHeroSlides(HOME_PAGE_DEFAULT_SECTIONS);
}

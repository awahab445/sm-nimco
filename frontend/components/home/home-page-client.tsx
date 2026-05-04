'use client';

import type { HomeSection } from '@/lib/cms/home-page-types';
import { HomeSectionRenderer } from './home-section-renderer';

interface HomePageClientProps {
  sections: HomeSection[];
}

/**
 * Renders CMS-driven homepage blocks. Section order and content come from
 * `getHomePageSections()` (defaults or API).
 */
export function HomePageClient({ sections }: HomePageClientProps) {
  const first = sections[0];
  const useImmersiveLead =
    first?.type === 'hero_slider' && first.slides.length > 0;
  const bodySections = useImmersiveLead ? sections.slice(1) : sections;

  return (
    <div className="min-w-0">
      {useImmersiveLead && (
        <div className="w-full" data-home-section={first.type} id={`section-${first.id}`}>
          <HomeSectionRenderer section={first} heroLayout="immersive" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 md:pt-16 lg:px-8">
        <div className="flex flex-col gap-16 md:gap-20">
          {bodySections.map((section) => (
            <div key={section.id} data-home-section={section.type} id={`section-${section.id}`}>
              <HomeSectionRenderer section={section} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { getHomePageSections } from '@/lib/cms/home-page.service';
import { fetchCategoryTree } from '@/lib/catalog/catalog.server';
import { fetchBundleDeals } from '@/lib/deals/deals.server';
import { HomePageView } from '@/components/home/home-page-view';
import { SmNimcoHomeView } from '@/components/themes/sm-nimco/home-view';
import { JsonLd } from '@/components/seo/json-ld';
import { STORE_NAME } from '@/lib/config';
import { absoluteUrl, buildPageMetadata, getSiteUrl } from '@/lib/seo';
import { fetchActiveTheme } from '@/lib/theme/theme.server';
import { toStoreThemePresetId } from '@/lib/theme/types';

/** ISR: keep homepage fresh for CMS edits without forcing every request to SSR. */
export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: STORE_NAME,
  description: `${STORE_NAME} — Authentic & crispy Pakistani nimco and sweets. Premium quality traditional snacks delivered fresh across Pakistan.`,
  path: '/',
  absoluteTitle: true,
});

export default async function HomePage() {
  const activeTheme = await fetchActiveTheme();
  const storeTheme = toStoreThemePresetId(activeTheme);
  const siteUrl = getSiteUrl();

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: STORE_NAME,
    url: siteUrl,
  };

  const [sections, categories, deals] = await Promise.all([
    getHomePageSections(),
    fetchCategoryTree(),
    fetchBundleDeals(),
  ]);

  return <HomePageView sections={sections} categories={categories} deals={deals} />;
}

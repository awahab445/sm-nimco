import type { Metadata } from 'next';
import { getHomePageSections } from '@/lib/cms/home-page.service';
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
  description: `${STORE_NAME} — Something crispy & delicious is coming soon. Premium Nimco, traditional snacks, and doorstep delivery across Pakistan.`,
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

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: STORE_NAME,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/products')}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd data={[organizationLd, websiteLd]} />
      {storeTheme === 'sm_nimco' ? (
        <SmNimcoHomeView />
      ) : (
        <HomePageView sections={await getHomePageSections()} />
      )}
    </>
  );
}

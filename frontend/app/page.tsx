import type { Metadata } from 'next';
import { getHomePageSections } from '@/lib/cms/home-page.service';
import { HomePageView } from '@/components/home/home-page-view';
import { JsonLd } from '@/components/seo/json-ld';
import { STORE_NAME } from '@/lib/config';
import { absoluteUrl, buildPageMetadata, getSiteUrl } from '@/lib/seo';

/** ISR: keep homepage fresh for CMS edits without forcing every request to SSR. */
export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: STORE_NAME,
  description: `${STORE_NAME} — shop quality products with secure checkout and order tracking.`,
  path: '/',
  absoluteTitle: true,
});

export default async function HomePage() {
  const sections = await getHomePageSections();
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
      <HomePageView sections={sections} />
    </>
  );
}

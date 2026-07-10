import type { Metadata } from 'next';
import { PolicyPageView } from '@/components/cms/policy-page-view';
import { getPolicyPageBySlug } from '@/lib/cms/policy-page.service';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPolicyPageBySlug('shipping-returns');
  return buildPageMetadata({
    title: page.metaTitle?.trim() || page.title,
    description: page.metaDescription?.trim() || page.excerpt?.trim() || undefined,
    path: '/shipping-returns',
  });
}

export default async function ShippingReturnsPage() {
  const page = await getPolicyPageBySlug('shipping-returns');
  return <PolicyPageView page={page} />;
}

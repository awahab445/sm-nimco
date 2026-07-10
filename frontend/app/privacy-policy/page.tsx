import type { Metadata } from 'next';
import { PolicyPageView } from '@/components/cms/policy-page-view';
import { getPolicyPageBySlug } from '@/lib/cms/policy-page.service';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPolicyPageBySlug('privacy-policy');
  return buildPageMetadata({
    title: page.metaTitle?.trim() || page.title,
    description: page.metaDescription?.trim() || page.excerpt?.trim() || undefined,
    path: '/privacy-policy',
  });
}

export default async function PrivacyPolicyPage() {
  const page = await getPolicyPageBySlug('privacy-policy');
  return <PolicyPageView page={page} />;
}

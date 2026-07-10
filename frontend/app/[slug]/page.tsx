import type { Metadata } from 'next';
import { StaticPage } from '@/components/cms/static-page';
import { getCmsPageBySlug } from '@/lib/cms/cms-page.service';
import { buildPageMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCmsPageBySlug(slug);
  if (!page) {
    return { title: 'Page not found', robots: { index: false, follow: false } };
  }
  return buildPageMetadata({
    title: page.metaTitle?.trim() || page.title,
    description: page.metaDescription?.trim() || page.excerpt?.trim() || undefined,
    path: `/${page.slug}`,
  });
}

export default async function CmsPageBySlugRoute({ params }: Props) {
  const { slug } = await params;
  const page = await getCmsPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <StaticPage page={page} />;
}

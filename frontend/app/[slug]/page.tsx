import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { StaticPage } from '@/components/cms/static-page';
import { getCmsPageBySlug } from '@/lib/cms/cms-page.service';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCmsPageBySlug(slug);
  if (!page) {
    return { title: 'Page not found' };
  }
  return {
    title: page.metaTitle?.trim() || page.title,
    description: page.metaDescription?.trim() || page.excerpt?.trim() || undefined,
  };
}

export default async function CmsPageBySlugRoute({ params }: Props) {
  const { slug } = await params;
  const page = await getCmsPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <StaticPage page={page} />;
}

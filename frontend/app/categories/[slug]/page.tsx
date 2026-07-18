import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import { fetchCategoryBySlug } from '@/lib/catalog/catalog.server';
import { absoluteUrl, buildPageMetadata, plainText } from '@/lib/seo';
import { CategoryPageClient } from './category-page-client';
import { PlpProductGridSkeleton } from '@/components/products/plp-product-grid-skeleton';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) {
    return { title: 'Category not found', robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    title: category.name,
    description:
      plainText(category.description) ||
      `Shop ${category.name} products.`,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: plainText(category.description),
    url: absoluteUrl(`/categories/${category.slug}`),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: absoluteUrl('/products'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: absoluteUrl(`/categories/${category.slug}`),
      },
    ],
  };

  return (
    <>
      <JsonLd data={[jsonLd, breadcrumbLd]} />
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <PlpProductGridSkeleton count={6} />
          </div>
        }
      >
        <CategoryPageClient />
      </Suspense>
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import { fetchCategoryBySlug } from '@/lib/catalog/catalog.server';
import { absoluteUrl, buildPageMetadata, plainText } from '@/lib/seo';
import { CategoryPageClient } from './category-page-client';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>;
};

const PAGE_LIMIT = 12;

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await fetchAllCategories(3600);
  return categories
    .filter((category) => Boolean(category.slug?.trim()))
    .map((category) => ({ slug: category.slug }));
}

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

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  // Read ?page= on the server: useSearchParams in the client made the whole listing client-only, so crawlers saw no H1 or products.
  const page = Math.max(1, parseInt((await searchParams)?.page || '1', 10) || 1);
  const category = await fetchCategoryBySlug(slug);
  if (!category) notFound();

  // Always filter by the route slug (API resolves UUID + descendants).
  // Also accept resolved id when present for clients that only send UUIDs.
  const categoryFilter = category.slug?.trim() || slug.trim() || category.id?.trim();
  const [initialProducts, allCategories] = await Promise.all([
    categoryFilter
      ? fetchProductsByCategorySlug(categoryFilter, {
          page,
          limit: PAGE_LIMIT,
        })
      : Promise.resolve(null),
    fetchAllCategories(),
  ]);

  const ancestors = categoryAncestors(category, allCategories);
  const collectionLd = buildCollectionPageLd(category);
  const breadcrumbLd = buildBreadcrumbListLd(
    buildCategoryBreadcrumbItems(category, ancestors),
  );

  return (
    <>
      <JsonLd data={[collectionLd, breadcrumbLd]} />
      <CategoryPageClient
        page={page}
        initialCategory={category}
        initialProducts={initialProducts}
        initialCategories={allCategories}
      />
    </>
  );
}

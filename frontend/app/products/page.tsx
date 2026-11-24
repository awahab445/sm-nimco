import { Suspense } from 'react';
import { PlpProductGridSkeleton } from '@/components/products/plp-product-grid-skeleton';
import { fetchProductList } from '@/lib/catalog/catalog.server';
import { parsePlpFilters, plpStateToListQuery } from '@/lib/plp-url-state';
import { ProductsContent } from './products-content';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Fetches the first page on the server so the product grid is in the HTML, then the client takes over filters. */
export default async function ProductsPage({ searchParams }: Props) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') sp.set(key, value);
    else if (Array.isArray(value) && value[0] != null) sp.set(key, value[0]);
  }
  const listQuery = plpStateToListQuery(parsePlpFilters(sp));
  const initialData = await fetchProductList(listQuery);

  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <PlpProductGridSkeleton count={6} />
        </div>
      }
    >
      <ProductsContent initialData={initialData} initialQueryKey={JSON.stringify(listQuery)} />
    </Suspense>
  );
}

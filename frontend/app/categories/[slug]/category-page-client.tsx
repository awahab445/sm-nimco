'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { productApi, categoryApi, inventoryApi, type ProductListResponse, type Category } from '@/lib/api-client';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { StorefrontProductCard, getVariantForCart } from '@/components/product/storefront-product-card';
import { CategorySidebar } from '@/components/products/category-sidebar';
import { PlpProductGridSkeleton } from '@/components/products/plp-product-grid-skeleton';
import {
  PlpToolbar,
  plpListingClass,
  sortProducts,
  type PlpListingMode,
  type PlpSortOption,
} from '@/components/products/plp-toolbar';
import { PlpPagination } from '@/components/products/plp-pagination';
import { storefrontUi } from '@/lib/storefront-ui';

const PAGE_LIMIT = 12;

export function CategoryPageClient() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [category, setCategory] = useState<Category | null>(null);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<PlpSortOption>('featured');
  const [listingMode, setListingMode] = useState<PlpListingMode>('grid-4');

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });
    categoryApi
      .getCategoryBySlug(slug)
      .then((cat) => {
        if (cancelled) return;
        setCategory(cat);
        return productApi.listProducts({ page, limit: PAGE_LIMIT, category: cat.id });
      })
      .then((res) => {
        if (cancelled || !res) return;
        setData(res);
        const variantIds = (res.data ?? []).map((p) => getVariantForCart(p)?.id).filter(Boolean) as string[];
        if (variantIds.length > 0) {
          inventoryApi.getAvailability(variantIds).then((r) => {
            if (!cancelled) setAvailability(r.data);
          });
        } else if (!cancelled) {
          setAvailability({});
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load category');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, page]);

  const products = useMemo(() => data?.data ?? [], [data?.data]);
  const displayProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const total = data?.meta?.total ?? products.length;
  const totalPages = data?.meta?.totalPages ?? 1;
  const listingClass = useMemo(() => plpListingClass(listingMode), [listingMode]);
  const isInitialLoad = loading && data === null;
  const bannerSrc = resolveImageUrl(category?.bannerUrl);

  const hrefForPage = useCallback(
    (p: number) => {
      const qs = new URLSearchParams(searchParams.toString());
      if (p <= 1) qs.delete('page');
      else qs.set('page', String(p));
      const s = qs.toString();
      return s ? `${pathname}?${s}` : pathname;
    },
    [pathname, searchParams],
  );

  // Keep URL page in range when meta arrives
  useEffect(() => {
    if (!data?.meta) return;
    const max = Math.max(1, data.meta.totalPages ?? 1);
    if (page > max) {
      router.replace(hrefForPage(max), { scroll: false });
    }
  }, [data?.meta, page, router, hrefForPage]);

  return (
    <>
      {bannerSrc ? (
        <div className="relative w-full overflow-hidden bg-muted">
          <div className="relative mx-auto aspect-[21/7] max-h-64 w-full max-w-[1920px] sm:max-h-80">
            <Image
              src={bannerSrc}
              alt={category?.name ? `${category.name} banner` : 'Category banner'}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                {category?.name ?? slug}
              </h1>
              {category?.description ? (
                <p className="mt-1.5 max-w-2xl text-sm text-white/90 sm:text-base">
                  {category.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="flex w-full min-w-0 flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
          <CategorySidebar />

          <div className="min-w-0 w-full flex-1">
            <nav className="mb-4 text-[13px] text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/products" className="transition-colors hover:text-[var(--navbar-link-hover,var(--primary-hover))]">
                Products
              </Link>
              <span className="mx-2 text-border" aria-hidden>/</span>
              <span className="text-foreground">{category?.name ?? slug}</span>
            </nav>

            {!bannerSrc ? (
              <div className="mb-6 sm:mb-8">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {category?.name ?? slug}
                </h1>
                {category?.description && (
                  <p className="mt-1.5 text-sm text-muted-foreground">{category.description}</p>
                )}
              </div>
            ) : null}

          {!isInitialLoad && !error ? (
            <PlpToolbar
              sortBy={sortBy}
              onSortChange={setSortBy}
              listingMode={listingMode}
              onListingModeChange={setListingMode}
              resultSummary={
                <p className="plp-toolbar__result-text text-sm text-muted-foreground">
                  Showing {total} {total === 1 ? 'result' : 'results'}
                </p>
              }
            />
          ) : null}

          {isInitialLoad ? (
            <PlpProductGridSkeleton
              columns={listingMode === 'grid-3' ? 'comfortable' : listingMode === 'list' ? 'list' : 'default'}
            />
          ) : error ? (
            <div className="border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center sm:py-24">
              <p className="text-sm text-muted-foreground">No products in this category.</p>
              <Link href="/products" className={`mt-3 inline-block text-xs uppercase tracking-wider ${storefrontUi.link}`}>
                Browse all products
              </Link>
            </div>
          ) : (
            <div className={listingClass}>
              {displayProducts.map((product) => {
                const variant = getVariantForCart(product);
                return (
                  <StorefrontProductCard
                    key={product.id}
                    product={product}
                    layout={listingMode === 'list' ? 'list' : 'grid'}
                    availableQuantity={variant ? availability[variant.id] : undefined}
                    availabilityByVariant={availability}
                  />
                );
              })}
            </div>
          )}

          {!isInitialLoad && !error ? (
            <PlpPagination page={page} totalPages={totalPages} hrefForPage={hrefForPage} />
          ) : null}
        </div>
      </div>
    </div>
    </>
  );
}

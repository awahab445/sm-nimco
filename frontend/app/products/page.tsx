'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { productApi, inventoryApi, type ProductListResponse } from '@/lib/api-client';
import { ProductCard, getVariantForCart } from '@/components/product/product-card';
import { CategorySidebar } from '@/components/products/category-sidebar';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const search = searchParams.get('search') || undefined;
  const categoryId = searchParams.get('category') || undefined;

  const [data, setData] = useState<ProductListResponse | null>(null);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productApi
      .listProducts({ page, limit: 12, search, category: categoryId })
      .then((res) => {
        if (!cancelled) setData(res);
        const variantIds = (res?.data ?? []).map((p) => getVariantForCart(p)?.id).filter(Boolean) as string[];
        if (variantIds.length > 0) {
          inventoryApi.getAvailability(variantIds).then((r) => {
            if (!cancelled) setAvailability(r.data);
          });
        } else {
          setAvailability({});
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load products');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search, categoryId]);

  const products = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', String(p));
    if (search) params.set('search', search);
    if (categoryId) params.set('category', categoryId);
    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex gap-8">
        <CategorySidebar />
        <div className="min-w-0 flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Products
            </h1>
            <p className="mt-1 text-muted-foreground">
              {search ? `Search results for "${search}"` : categoryId ? 'Filtered by category.' : 'Browse all products.'}
            </p>
          </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/50 py-16 text-center">
          <p className="text-muted-foreground">No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const variant = getVariantForCart(product);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  showViewOnly
                  availableQuantity={variant ? availability[variant.id] : undefined}
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {page > 1 && (
                <a
                  href={buildPageUrl(page - 1)}
                  className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Previous
                </a>
              )}
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={buildPageUrl(page + 1)}
                  className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      )}
        </div>
      </div>
    </div>
  );
}

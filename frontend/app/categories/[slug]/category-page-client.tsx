'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productApi, categoryApi, inventoryApi, type ProductListResponse, type Category } from '@/lib/api-client';
import { ProductCard, getVariantForCart } from '@/components/product/product-card';
import { CategorySidebar } from '@/components/products/category-sidebar';
import { storefrontUi } from '@/lib/storefront-ui';

export function CategoryPageClient() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const page = 1;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    categoryApi
      .getCategoryBySlug(slug)
      .then((cat) => {
        if (cancelled) return;
        setCategory(cat);
        return productApi.listProducts({ page: 1, limit: 24, category: cat.id });
      })
      .then((res) => {
        if (cancelled || !res) return;
        setData(res);
        const variantIds = (res.data ?? []).map((p) => getVariantForCart(p)?.id).filter(Boolean) as string[];
        if (variantIds.length > 0) {
          inventoryApi.getAvailability(variantIds).then((r) => {
            if (!cancelled) setAvailability(r.data);
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load category');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  const products = data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex w-full min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <CategorySidebar />

        <div className="min-w-0 w-full flex-1">
          <div className="mb-6">
            <Link
              href="/products"
              className={`text-sm ${storefrontUi.link}`}
            >
              ← All products
            </Link>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {category?.name ?? slug}
            </h1>
            {category?.description && (
              <p className="mt-1 text-muted-foreground">{category.description}</p>
            )}
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
              <p className="text-muted-foreground">No products in this category.</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

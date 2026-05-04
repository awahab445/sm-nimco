'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productApi, inventoryApi, type ProductListResponse } from '@/lib/api-client';
import { ProductCard, getVariantForCart } from '@/components/product/product-card';
import type { ProductShelfSource } from '@/lib/cms/home-page-types';

interface ProductShelfSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  source: ProductShelfSource;
}

export function ProductShelfSection({ title, subtitle, viewAllHref, source }: ProductShelfSectionProps) {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const page = source.page ?? 1;
    const limit = source.limit;
    const query =
      source.kind === 'category'
        ? { page, limit, category: source.categoryId }
        : { page, limit };

    productApi
      .listProducts(query)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        const variantIds = (res?.data ?? [])
          .map((p) => getVariantForCart(p)?.id)
          .filter(Boolean) as string[];
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
  }, [source]);

  const products = data?.data ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          href={viewAllHref}
          className="shrink-0 text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/50 py-12 text-center text-muted-foreground">
          No products in this shelf yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const variant = getVariantForCart(product);
            return (
              <ProductCard
                key={product.id}
                product={product}
                availableQuantity={variant ? availability[variant.id] : undefined}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

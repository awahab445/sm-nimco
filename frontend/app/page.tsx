'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productApi, inventoryApi, type ProductListResponse } from '@/lib/api-client';
import { ProductCard, getVariantForCart } from '@/components/product/product-card';

export default function HomePage() {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    productApi
      .listProducts({ page: 1, limit: 8 })
      .then((res) => {
        if (!cancelled) setData(res);
        const variantIds = (res?.data ?? []).map((p) => getVariantForCart(p)?.id).filter(Boolean) as string[];
        if (variantIds.length > 0) {
          inventoryApi.getAvailability(variantIds).then((r) => {
            if (!cancelled) setAvailability(r.data);
          });
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
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-zinc-600 dark:border-t-blue-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      </div>
    );
  }

  const products = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
          Welcome to the store
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          Browse our products and add items to your cart.
        </p>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">
            Featured products
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 py-16 text-center dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-gray-600 dark:text-zinc-400">No products yet.</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">
              Add products in the admin to see them here.
            </p>
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
    </div>
  );
}

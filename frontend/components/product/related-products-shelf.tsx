'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productApi, inventoryApi, type Product } from '@/lib/api-client';
import { StorefrontProductCard, getVariantForCart } from '@/components/product/storefront-product-card';

type Props = {
  productId: string;
  categoryId?: string | null;
};

/** Kalles-style “You may also like” shelf — same-category products when available. */
export function RelatedProductsShelf({ productId, categoryId }: Props) {
  const [items, setItems] = useState<Product[]>([]);
  const [availability, setAvailability] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    productApi
      .listProducts({
        page: 1,
        limit: 8,
        ...(categoryId ? { category: categoryId } : {}),
      })
      .then((res) => {
        if (cancelled) return;
        const related = (res.data ?? []).filter((p) => p.id !== productId).slice(0, 4);
        setItems(related);
        const variantIds = related.map((p) => getVariantForCart(p)?.id).filter(Boolean) as string[];
        if (variantIds.length > 0) {
          inventoryApi.getAvailability(variantIds).then((r) => {
            if (!cancelled) setAvailability(r.data);
          });
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, categoryId]);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto mt-16 max-w-7xl border-t border-border/50 px-4 pb-8 pt-12 sm:mt-20 sm:px-6 sm:pt-14 lg:px-8">
      <div className="mb-8 text-center sm:mb-10">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          You may also like
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {items.map((product) => {
          const variant = getVariantForCart(product);
          return (
            <StorefrontProductCard
              key={product.id}
              product={product}
              availableQuantity={variant ? availability[variant.id] : undefined}
              availabilityByVariant={availability}
            />
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <Link
          href={categoryId ? `/products?category=${encodeURIComponent(categoryId)}` : '/products'}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:text-[var(--navbar-link-hover,var(--primary-hover))]"
        >
          View all
        </Link>
      </div>
    </section>
  );
}

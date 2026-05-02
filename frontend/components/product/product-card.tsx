'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { DEFAULT_CURRENCY } from '@/lib/config';

function formatPrice(value: string | number, currency = DEFAULT_CURRENCY): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(isNaN(n) ? 0 : n);
}

/** Variant to use for add-to-cart: first real variant, or synthetic for simple product with no variants. */
export function getVariantForCart(product: Product): { id: string; productId: string; price: number } | null {
  const variants = product.variants;
  if (variants?.length) {
    const v = variants[0];
    const price = typeof v.price === 'string' ? parseFloat(v.price) : v.price;
    return { id: v.id, productId: product.id, price: isNaN(Number(price)) ? 0 : Number(price) };
  }
  if (product.type === 'simple' || !product.type) {
    const price = typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice;
    return { id: product.id, productId: product.id, price: isNaN(Number(price)) ? 0 : Number(price) };
  }
  return null;
}

interface ProductCardProps {
  product: Product;
  /** If true, show "View" link instead of "Add to cart" (for list where we prefer going to detail) */
  showViewOnly?: boolean;
  /** Available quantity for the cart variant; when 0, Add to cart is disabled and out-of-stock message is shown */
  availableQuantity?: number;
}

export function ProductCard({ product, showViewOnly = false, availableQuantity }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const variant = getVariantForCart(product);
  const inStock = availableQuantity === undefined ? true : availableQuantity > 0;
  const canAddToCart = variant && !showViewOnly && inStock;
  const image = product.images?.[0] ?? product.images?.find((i) => i.isPrimary);
  const imageUrl = image?.url;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant || adding) return;
    setAdding(true);
    try {
      await addToCart(product.id, variant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // Error shown in store / could add toast
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-zinc-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={image?.alt ?? product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-zinc-500">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 dark:text-zinc-50 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
          {formatPrice(product.basePrice)}
        </p>
        <div className="mt-auto pt-3">
          {canAddToCart ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full rounded-md bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {added ? 'Added' : adding ? 'Adding…' : 'Add to cart'}
            </button>
          ) : variant && !showViewOnly && availableQuantity !== undefined && availableQuantity === 0 ? (
            <div className="w-full rounded-md border border-amber-200 bg-amber-50 py-2 text-center text-sm font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
              Stock unavailable for this product
            </div>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="block w-full rounded-md border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              View
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

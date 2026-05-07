'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { DEFAULT_CURRENCY } from '@/lib/config';
import { resolveImageUrl } from '@/lib/resolve-image-url';

function formatPrice(value: string | number, currency = DEFAULT_CURRENCY): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(isNaN(n) ? 0 : n);
}

/** Matches primary actions elsewhere on product cards (same as Add to cart). */
const productCardPrimaryCtaClass =
  'w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90';

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
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const variant = getVariantForCart(product);
  const inStock = availableQuantity === undefined ? true : availableQuantity > 0;
  const canAddToCart = variant && !showViewOnly && inStock;
  const image = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
  const imageUrl = resolveImageUrl(image?.url);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant || adding) return;
    setAdding(true);
    try {
      await addToCart(product.id, variant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      router.push('/cart');
    } catch {
      // Error shown in store / could add toast
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={image?.alt ?? product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-foreground line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm font-medium text-foreground/90">
          {formatPrice(product.basePrice)}
        </p>
        <div className="mt-auto pt-3">
          {canAddToCart ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className={`${productCardPrimaryCtaClass} disabled:opacity-50`}
            >
              {added ? 'Added' : adding ? 'Adding…' : 'Add to cart'}
            </button>
          ) : variant && !showViewOnly && availableQuantity !== undefined && availableQuantity === 0 ? (
            <div className="w-full rounded-md border border-warning/30 bg-warning/10 py-2 text-center text-sm font-medium text-warning">
              Stock unavailable for this product
            </div>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className={`block text-center ${productCardPrimaryCtaClass}`}
            >
              View
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

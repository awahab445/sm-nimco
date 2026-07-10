'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { notifyAddToCartError } from '@/lib/notify-add-to-cart';
import { formatPrice } from '@/lib/currency';
import { imageAlt } from '@/lib/seo';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { storefrontUi } from '@/lib/storefront-ui';
import { StorefrontImage } from '@/components/ui/storefront-image';
import { getVariantForCart } from '@/lib/product-cart-variant';

export { getVariantForCart } from '@/lib/product-cart-variant';

/** Matches primary actions elsewhere on product cards (same as Add to cart). */
const productCardPrimaryCtaClass = storefrontUi.btnPrimaryBlock;

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
    } catch (err) {
      notifyAddToCartError(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-product-card transition-all hover:border-primary/35 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-secondary/30">
        {imageUrl ? (
          <StorefrontImage
            src={imageUrl}
            alt={imageAlt(image, product.name)}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition group-hover:scale-105"
            loading="lazy"
            quality={70}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-foreground line-clamp-2 transition-colors group-hover:text-primary">
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
              className={productCardPrimaryCtaClass}
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

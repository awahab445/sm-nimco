'use client';

import Link from 'next/link';
import { useState, type MouseEvent } from 'react';
import type { Product } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { notifyAddToCartError } from '@/lib/notify-add-to-cart';
import { formatPrice } from '@/lib/currency';
import { imageAlt } from '@/lib/seo';
import { getProductImageSrcs, getProductImagesOrdered } from '@/lib/resolve-image-url';
import { StorefrontImage } from '@/components/ui/storefront-image';
import { getVariantForCart } from '@/lib/product-cart-variant';
import { getProductListDisplayPrice } from '@/lib/product-display-price';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';
import { ProductQuickView } from '@/components/product/product-quick-view';
import { WishlistToggleButton } from '@/components/product/wishlist-toggle-button';

export { getVariantForCart } from '@/lib/product-cart-variant';

interface ProductCardProps {
  product: Product;
  /** @deprecated Kept for callers; overlay icons always provide quick view + ATC. */
  showViewOnly?: boolean;
  /** Available quantity for the cart variant; when 0, Add to cart is disabled and out-of-stock message is shown */
  availableQuantity?: number;
  /** Grid vs list listing mode (PLP toolbar). */
  layout?: 'grid' | 'list';
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function ProductCard({
  product,
  availableQuantity,
  layout = 'grid',
}: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const variant = getVariantForCart(product);
  const inStock = availableQuantity === undefined ? true : availableQuantity > 0;
  const canAddToCart = Boolean(variant && inStock);
  const displayPrice = getProductListDisplayPrice(product);

  const orderedImages = getProductImagesOrdered(product.images);
  const image = orderedImages[0];
  const imageSrcs = getProductImageSrcs(product.images);
  const imageUrl = imageSrcs[0];
  if (process.env.NODE_ENV === 'development') {
    console.log('Product Image Src:', imageUrl, {
      product: product.name,
      candidates: imageSrcs,
    });
  }
  const isNew =
    product.createdAt != null &&
    Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 30;
  const isList = layout === 'list';

  const handleAddToCart = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant || adding || !inStock) return;
    setAdding(true);
    try {
      await addToCart(product.id, variant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      notifyAddToCartError(err);
    } finally {
      setAdding(false);
    }
  };

  const openQuickView = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const actionStack = (
    <div className="product-card__actions pointer-events-none absolute inset-y-0 right-0 z-10 flex flex-col items-end justify-center gap-2 p-2.5 sm:p-3">
      <button
        type="button"
        onClick={openQuickView}
        className="product-card__action-btn pointer-events-auto"
        aria-label="Quick view"
      >
        <EyeIcon className="h-[18px] w-[18px]" />
      </button>
      <WishlistToggleButton
        productId={product.id}
        variant="card"
        stopPropagation
        iconClassName="h-[18px] w-[18px]"
      />
      {canAddToCart ? (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className="product-card__action-btn pointer-events-auto"
          aria-label={added ? 'Added to cart' : 'Add to cart'}
        >
          <ShoppingBagIcon className="h-[18px] w-[18px]" strokeWidth={1.3} />
        </button>
      ) : (
        <span
          className="product-card__action-btn pointer-events-none opacity-45"
          aria-label={availableQuantity === 0 ? 'Out of stock' : 'Unavailable'}
          title={availableQuantity === 0 ? 'Out of stock' : 'Unavailable'}
        >
          <ShoppingBagIcon className="h-[18px] w-[18px]" strokeWidth={1.3} />
        </span>
      )}
    </div>
  );

  const media = (
    <div
      className={`product-card__media relative w-full overflow-hidden bg-neutral-50 ${
        isList
          ? /* Mobile list: full-bleed stacked image; md+: side thumbnail */
            'product-card__media--list-bleed aspect-[4/5] md:aspect-[3/4] md:w-40 md:shrink-0 lg:w-48'
          : 'aspect-[3/4]'
      }`}
    >
      <Link href={`/products/${product.slug}`} className="absolute inset-0 block">
        {imageUrl ? (
          <StorefrontImage
            src={imageUrl}
            fallbackSrcs={imageSrcs.slice(1)}
            alt={imageAlt(image, product.name)}
            fill
            sizes={
              isList
                ? '(min-width: 768px) 12rem, 100vw'
                : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw'
            }
            className="h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            quality={70}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5 sm:left-3 sm:top-3">
        {isNew ? (
          <span className="rounded-sm bg-primary-hover px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">
            New
          </span>
        ) : null}
      </div>

      {actionStack}
    </div>
  );

  const info = (
    <div
      className={`flex min-w-0 flex-1 flex-col text-left ${
        isList
          ? 'justify-center px-0 py-3.5 md:px-6 md:py-2'
          : 'px-0.5 pt-3 pb-1'
      }`}
    >
      <Link href={`/products/${product.slug}`}>
        <h3
          className={`font-display font-medium leading-snug text-foreground transition-colors group-hover:text-[var(--navbar-link-hover,var(--primary-hover))] ${
            isList
              ? 'text-sm line-clamp-2 sm:text-base'
              : 'text-[13px] line-clamp-2 sm:text-sm'
          }`}
        >
          {product.name}
        </h3>
      </Link>
      <p className={`text-sm ${isList ? 'mt-2' : 'mt-1.5'}`}>
        <span className="font-medium text-product-price">{formatPrice(displayPrice)}</span>
      </p>
      {isList && product.shortDescription ? (
        <p className="mt-2 hidden text-sm text-muted-foreground line-clamp-2 md:block">
          {product.shortDescription}
        </p>
      ) : null}
      {added ? (
        <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-[var(--navbar-link-hover,var(--primary-hover))]">
          Added to cart
        </p>
      ) : null}
    </div>
  );

  return (
    <>
      <div
        className={`product-card group min-w-0 bg-transparent text-foreground ${
          isList
            ? 'product-card--list flex flex-col border-b border-border/50 pb-6 last:border-b-0 md:flex-row md:items-stretch'
            : 'flex flex-col'
        }`}
      >
        {media}
        {info}
      </div>
      <ProductQuickView
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        availableQuantity={availableQuantity}
      />
    </>
  );
}

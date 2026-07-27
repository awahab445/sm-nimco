'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { Product } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { notifyAddToCartError } from '@/lib/notify-add-to-cart';
import { formatPrice } from '@/lib/currency';
import { imageAlt } from '@/lib/seo';
import { getProductImageSrcs, getProductImagesOrdered } from '@/lib/resolve-image-url';
import { StorefrontImage } from '@/components/ui/storefront-image';
import { getVariantForCart } from '@/lib/product-cart-variant';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';
import { WishlistToggleButton } from '@/components/product/wishlist-toggle-button';

type Props = {
  product: Product;
  open: boolean;
  onClose: () => void;
  availableQuantity?: number;
};

export function ProductQuickView({ product, open, onClose, availableQuantity }: Props) {
  const [mounted, setMounted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const variant = getVariantForCart(product);
  const inStock = availableQuantity === undefined ? true : availableQuantity > 0;
  const canAdd = Boolean(variant && inStock);
  const orderedImages = getProductImagesOrdered(product.images);
  const image = orderedImages[0];
  const imageSrcs = getProductImageSrcs(product.images);
  const imageUrl = imageSrcs[0];
  const blurb =
    product.shortDescription?.trim() ||
    (product.description
      ? product.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
      : '');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const handleAdd = async () => {
    if (!variant || adding) return;
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

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="product-quick-view fixed inset-0 z-[280] flex items-end justify-center sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 animate-plp-backdrop-enter"
        aria-label="Close quick view"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${product.name}`}
        className="product-quick-view__panel relative z-10 flex max-h-[min(94dvh,44rem)] w-full max-w-3xl flex-col overflow-hidden bg-background shadow-[0_16px_48px_color-mix(in_srgb,var(--foreground)_18%,transparent)] animate-plp-sheet-enter sm:max-h-[min(90vh,34rem)] sm:flex-row sm:animate-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 p-1.5 text-foreground transition-colors hover:text-[var(--navbar-link-hover,var(--primary-hover))]"
          aria-label="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 14" fill="none" aria-hidden>
            <path d="M15 0L1 14m14 0L1 0" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </button>

        {/* Mobile: capped height so ATC/icons stay in the sheet. Desktop: side media column. */}
        <div className="product-quick-view__media relative h-[min(38dvh,16rem)] max-h-[30dvh] w-full shrink-0 bg-neutral-50 sm:h-auto sm:max-h-none sm:min-h-[22rem] sm:w-[46%]">
          {imageUrl ? (
            <StorefrontImage
              src={imageUrl}
              fallbackSrcs={imageSrcs.slice(1)}
              alt={imageAlt(image, product.name)}
              fill
              sizes="(min-width: 640px) 40vw, 100vw"
              className="object-contain object-center"
              quality={75}
            />
          ) : (
            <div className="flex h-full min-h-[10rem] items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 sm:px-7 sm:pt-8">
            <h2 className="font-display pr-8 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {product.name}
            </h2>
            <p className="mt-2 text-base font-medium text-product-price">
              {formatPrice(product.basePrice)}
            </p>
            {blurb ? (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                {blurb}
              </p>
            ) : null}
          </div>

          {/* Pinned actions — ATC + wishlist */}
          <div className="product-quick-view__actions shrink-0 border-t border-border/70 bg-background px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex items-stretch gap-2.5">
              {canAdd ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding}
                  suppressHydrationWarning
                  className="btn-pdp-atc product-quick-view__atc inline-flex min-w-0 flex-1 items-center justify-center gap-2 px-4 py-3 font-bold text-[var(--primary-foreground,#d4af37)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBagIcon
                    className="h-4 w-4 shrink-0 text-[var(--primary-foreground,#d4af37)]"
                    strokeWidth={1.4}
                  />
                  <span className="truncate font-bold text-[var(--primary-foreground,#d4af37)]">
                    {added ? 'Added' : adding ? 'Adding…' : 'Add to cart'}
                  </span>
                </button>
              ) : (
                <span className="flex min-w-0 flex-1 items-center justify-center border border-warning/30 bg-warning/10 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-warning">
                  {availableQuantity === 0 ? 'Out of stock' : 'Unavailable'}
                </span>
              )}

              <WishlistToggleButton
                productId={product.id}
                variant="quick"
                iconClassName="h-5 w-5"
              />
            </div>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="mt-3 block w-full py-1.5 text-center text-xs font-bold uppercase tracking-wider text-[var(--brand-purple-dark,var(--foreground))] underline-offset-4 transition-colors hover:text-[var(--brand-gold-hover,var(--navbar-link-hover,var(--primary-hover)))] hover:underline"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

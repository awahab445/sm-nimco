'use client';

import Link from 'next/link';
import { useState, type MouseEvent } from 'react';
import type { Product } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { notifyAddToCartError } from '@/lib/notify-add-to-cart';
import { formatPrice } from '@/lib/currency';
import { imageAlt } from '@/lib/seo';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { StorefrontImage } from '@/components/ui/storefront-image';
import { getVariantForCart } from '@/lib/product-cart-variant';
import { ProductQuickView } from '@/components/product/product-quick-view';

interface SmNimcoProductCardProps {
  product: Product;
  availableQuantity?: number;
  badge?: string;
}

function variantChips(product: Product): string[] {
  const option = product.options?.[0]?.option;
  if (!option?.values?.length) return [];
  return option.values
    .filter((v) => v.isActive)
    .slice(0, 3)
    .map((v) => v.value);
}

export function SmNimcoProductCard({
  product,
  availableQuantity,
  badge,
}: SmNimcoProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const variant = getVariantForCart(product);
  const inStock = availableQuantity === undefined ? true : availableQuantity > 0;
  const canAddToCart = Boolean(variant && inStock);
  const image = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
  const imageUrl = resolveImageUrl(image?.url);
  const chips = variantChips(product);
  const description =
    product.shortDescription?.trim() ||
    product.description?.trim()?.slice(0, 90) ||
    'Prepared fresh with traditional recipes.';

  const handleAddToCart = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant || adding || !inStock) return;
    setAdding(true);
    try {
      await addToCart(product.id, variant.id, 1);
    } catch (err) {
      notifyAddToCartError(err);
    } finally {
      setAdding(false);
    }
  };

  const openDetails = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <div className="sm-nimco-product-card flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all">
        <div>
          <div className="relative mb-3 flex h-44 items-center justify-center overflow-hidden rounded-xl bg-[var(--brand-bg-light,#faf8f5)]">
            {badge ? (
              <span
                className={`absolute left-2 top-2 z-10 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                  badge === 'HOT'
                    ? 'bg-red-600 text-white'
                    : 'bg-[var(--brand-gold-primary,#d4af37)] text-[var(--brand-purple-dark,#1e1035)]'
                }`}
              >
                {badge}
              </span>
            ) : null}
            {imageUrl ? (
              <StorefrontImage
                src={imageUrl}
                alt={imageAlt(image, product.name)}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain p-3"
                loading="lazy"
                quality={70}
              />
            ) : (
              <span className="font-heading text-3xl font-bold text-[var(--brand-purple-dark,#1e1035)]">
                {product.name.slice(0, 1)}
              </span>
            )}
          </div>
          <h3 className="font-bold text-[var(--brand-purple-dark,#1e1035)]">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{description}</p>
          {chips.length > 0 ? (
            <div className="my-3 flex flex-wrap gap-1">
              {chips.map((chip, i) => (
                <span
                  key={`${product.id}-${chip}`}
                  className={
                    i === 0
                      ? 'rounded bg-[var(--brand-purple-dark,#1e1035)] px-2 py-0.5 text-xs font-bold text-[var(--brand-gold-primary,#d4af37)]'
                      : 'rounded border px-2 py-0.5 text-xs text-gray-600'
                  }
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : (
            <div className="my-3" />
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-base font-bold text-[var(--brand-purple-dark,#1e1035)]">
            {formatPrice(product.basePrice)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openDetails}
              className="rounded-lg bg-[var(--brand-purple-dark,#1e1035)] px-3 py-2 text-xs font-bold text-[var(--brand-gold-primary,#d4af37)] transition-colors hover:bg-[var(--brand-purple-deep,#2e1a47)]"
            >
              View Details
            </button>
            {canAddToCart ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                className="rounded-lg bg-[var(--brand-gold-primary,#d4af37)] px-3 py-2 text-xs font-bold text-[var(--brand-purple-dark,#1e1035)] transition-colors hover:bg-[var(--brand-gold-hover,#b89628)] disabled:opacity-60"
              >
                {adding ? '…' : 'Add'}
              </button>
            ) : null}
          </div>
        </div>

        <Link href={`/products/${product.slug}`} className="sr-only">
          View {product.name}
        </Link>
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

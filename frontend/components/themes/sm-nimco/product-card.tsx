'use client';

import Link from 'next/link';
import { useState, type MouseEvent } from 'react';
import type { Product, ProductVariant } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { notifyAddToCartError } from '@/lib/notify-add-to-cart';
import { formatPrice } from '@/lib/currency';
import { imageAlt } from '@/lib/seo';
import { getProductImageSrcs, getProductImagesOrdered } from '@/lib/resolve-image-url';
import { StorefrontImage } from '@/components/ui/storefront-image';
import { getVariantForCart } from '@/lib/product-cart-variant';
import {
  getCheapestVariantChipId,
  getProductListDisplayPrice,
  parseProductPrice,
} from '@/lib/product-display-price';
import { ProductQuickView } from '@/components/product/product-quick-view';
import { WishlistToggleButton } from '@/components/product/wishlist-toggle-button';

interface SmNimcoProductCardProps {
  product: Product;
  /** Availability keyed by variant id (preferred) or a single quantity for the default variant. */
  availableQuantity?: number;
  availabilityByVariant?: Record<string, number>;
  badge?: string;
}

type VariantChip = {
  id: string;
  label: string;
  price: number;
};

function parsePrice(value: string | number | undefined | null): number {
  return parseProductPrice(value);
}

function variantLabel(variant: ProductVariant): string {
  const fromOption = variant.optionValues
    ?.map((ov) => ov.value?.value?.trim())
    .filter(Boolean)
    .join(' / ');
  if (fromOption) return fromOption;
  const name = variant.name?.trim();
  if (name) {
    const stripped = name.replace(/^[^:]+:\s*/, '').trim();
    return stripped || name;
  }
  return variant.sku;
}

/** Chips from this product's variants only (not the global option catalog). */
function getVariantChips(product: Product): VariantChip[] {
  const variants = [...(product.variants ?? [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );
  return variants.map((variant) => ({
    id: variant.id,
    label: variantLabel(variant),
    price: parsePrice(variant.price),
  }));
}

export function SmNimcoProductCard({
  product,
  availableQuantity,
  availabilityByVariant,
  badge,
}: SmNimcoProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const chips = getVariantChips(product);
  const defaultVariant = getVariantForCart(product);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(() =>
    getCheapestVariantChipId(product.variants ?? []) ??
    chips[0]?.id ??
    defaultVariant?.id ??
    null,
  );

  const selectedChip =
    chips.find((c) => c.id === selectedVariantId) ?? chips[0] ?? null;
  const activeVariantId = selectedChip?.id ?? defaultVariant?.id ?? null;

  const stockForSelected =
    activeVariantId && availabilityByVariant
      ? availabilityByVariant[activeVariantId]
      : availableQuantity;
  const inStock = stockForSelected === undefined ? true : stockForSelected > 0;
  const canAddToCart = Boolean(activeVariantId && inStock);

  const displayPrice =
    selectedChip?.price ??
    defaultVariant?.price ??
    getProductListDisplayPrice(product);

  const orderedImages = getProductImagesOrdered(product.images);
  const image = orderedImages[0];
  const imageSrcs = getProductImageSrcs(product.images);
  const imageUrl = imageSrcs[0];
  const description =
    product.shortDescription?.trim() ||
    product.description?.trim()?.slice(0, 90) ||
    'Prepared fresh with traditional recipes.';

  /** Hide selector when there is nothing meaningful to choose (0–1 variants). */
  const showVariantSelector = chips.length > 1;

  const handleSelectVariant = (e: MouseEvent, variantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariantId(variantId);
  };

  const handleAddToCart = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeVariantId || adding || !inStock) return;
    setAdding(true);
    try {
      await addToCart(product.id, activeVariantId, 1);
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
      <div className="sm-nimco-product-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all">
        <div>
          <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-t-xl bg-[#f8f6f0]">
            {badge ? (
              <span
                className={`pointer-events-none absolute left-3 top-3 z-10 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                  badge === 'HOT'
                    ? 'bg-red-600 text-white'
                    : 'bg-[var(--brand-gold-primary,#d4af37)] text-[var(--brand-purple-dark,#1e1035)]'
                }`}
              >
                {badge}
              </span>
            ) : null}
            <WishlistToggleButton
              productId={product.id}
              variant="icon"
              stopPropagation
              className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-purple-dark,#1e1035)]/10 bg-white/95 text-[var(--brand-purple-dark,#1e1035)] shadow-sm transition-colors hover:border-[var(--brand-gold-primary,#d4af37)] hover:text-[var(--brand-gold-hover,#b89628)]"
              iconClassName="h-[18px] w-[18px]"
            />
            <Link
              href={`/products/${product.slug}`}
              className="relative z-0 flex h-full w-full cursor-pointer items-center justify-center p-2"
              aria-label={`View ${product.name}`}
            >
              {imageUrl ? (
                <div className="relative h-full w-full overflow-hidden">
                  <StorefrontImage
                    src={imageUrl}
                    fallbackSrcs={imageSrcs.slice(1)}
                    alt={imageAlt(image, product.name)}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    quality={70}
                  />
                </div>
              ) : (
                <span className="flex h-full w-full items-center justify-center font-heading text-3xl font-bold text-[var(--brand-purple-dark,#1e1035)]">
                  {product.name.slice(0, 1)}
                </span>
              )}
            </Link>
          </div>
          <div className="px-4">
            <Link
              href={`/products/${product.slug}`}
              className="cursor-pointer transition-colors hover:text-[var(--brand-gold-hover,#b89628)]"
            >
              <h3 className="line-clamp-2 font-bold text-[var(--brand-purple-dark,#1e1035)]">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{description}</p>
          {showVariantSelector ? (
            <div
              className="my-3 flex flex-wrap gap-1"
              role="group"
              aria-label={`${product.name} pack options`}
            >
              {chips.map((chip) => {
                const selected = chip.id === activeVariantId;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    suppressHydrationWarning
                    aria-pressed={selected}
                    onClick={(e) => handleSelectVariant(e, chip.id)}
                    className={
                      selected
                        ? 'rounded bg-[var(--brand-purple-dark,#1e1035)] px-2 py-0.5 text-xs font-bold text-[var(--brand-gold-primary,#d4af37)]'
                        : 'rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600 transition-colors hover:border-[var(--brand-purple-dark,#1e1035)]/40'
                    }
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="my-3" />
          )}
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <span className="shrink-0 text-base font-bold text-[var(--brand-purple-dark,#1e1035)]">
            {formatPrice(displayPrice)}
          </span>
          <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">
            <button
              type="button"
              onClick={openDetails}
              suppressHydrationWarning
              className="min-w-0 flex-1 rounded-lg bg-[var(--brand-purple-dark,#1e1035)] px-3 py-2 text-xs font-bold text-[var(--brand-gold-primary,#d4af37)] transition-colors hover:bg-[var(--brand-purple-deep,#2e1a47)] hover:text-[var(--brand-gold-primary,#d4af37)] sm:flex-none"
            >
              View Details
            </button>
            {canAddToCart ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                suppressHydrationWarning
                className="min-w-0 flex-1 rounded-lg bg-[var(--brand-gold-primary,#d4af37)] px-3 py-2 text-xs font-bold text-[var(--brand-purple-dark,#1e1035)] transition-colors hover:bg-[var(--brand-gold-hover,#b89628)] hover:text-[var(--brand-purple-dark,#1e1035)] disabled:opacity-60 sm:flex-none"
              >
                {adding ? '…' : 'Add'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <ProductQuickView
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        availableQuantity={stockForSelected}
      />
    </>
  );
}

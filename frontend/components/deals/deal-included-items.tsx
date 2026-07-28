'use client';

import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { formatPrice } from '@/lib/currency';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { formatVariantAttributes } from '@/lib/format-variant-attributes';
import { storefrontUi } from '@/lib/storefront-ui';
import { productApi, type Product } from '@/lib/api-client';
import type { StorefrontBundleDealItem } from '@/lib/deals/deals.server';
import { ProductQuickView } from '@/components/product/product-quick-view';

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

/** Build a minimal Product so Quick View still works if the full fetch fails. */
function toQuickViewProduct(item: StorefrontBundleDealItem): Product | null {
  if (!item.product) return null;
  const price = item.unitListPrice ?? item.variant?.price ?? 0;
  return {
    id: item.product.id,
    sku: item.product.sku,
    name: item.product.name,
    slug: item.product.slug,
    type: item.variant ? 'configurable' : 'simple',
    basePrice: price,
    status: 'active',
    images: (item.product.images ?? []).map((img, index) => ({
      id: `${item.product!.id}-img-${index}`,
      url: img.url,
      isPrimary: index === 0,
      position: index,
    })),
    variants: item.variant
      ? [
          {
            id: item.variant.id,
            productId: item.product.id,
            sku: item.variant.sku,
            name: item.variant.name,
            price: item.variant.price,
            optionValues: item.variant.optionValues,
          },
        ]
      : undefined,
  };
}

type Props = {
  items: StorefrontBundleDealItem[];
};

export function DealIncludedItems({ items }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  async function openQuickView(item: StorefrontBundleDealItem) {
    if (!item.product) return;
    setLoadingItemId(item.id);
    try {
      const product = item.product.slug
        ? await productApi.getProductBySlug(item.product.slug)
        : await productApi.getProductById(item.product.id);
      setSelectedProduct(product);
      setQuickViewOpen(true);
    } catch {
      const fallback = toQuickViewProduct(item);
      if (fallback) {
        setSelectedProduct(fallback);
        setQuickViewOpen(true);
      }
    } finally {
      setLoadingItemId(null);
    }
  }

  function onRowActivate(
    e: MouseEvent | KeyboardEvent,
    item: StorefrontBundleDealItem,
  ) {
    e.preventDefault();
    e.stopPropagation();
    void openQuickView(item);
  }

  return (
    <>
      <ul className="mt-4 space-y-4">
        {items.map((item) => {
          const image = resolveImageUrl(item.product?.images?.[0]?.url);
          const listPrice = item.unitListPrice ?? item.variant?.price;
          const variantLabels =
            item.variant?.variantAttributes?.filter((label) => label.trim().length > 0) ??
            formatVariantAttributes(
              (item.variant?.attributes as Record<string, unknown> | undefined) ?? undefined,
            );
          const canQuickView = Boolean(item.product);
          const isLoading = loadingItemId === item.id;

          return (
            <li key={item.id}>
              <div
                role={canQuickView ? 'button' : undefined}
                tabIndex={canQuickView ? 0 : undefined}
                aria-label={
                  canQuickView
                    ? `View details for ${item.product?.name ?? 'product'}`
                    : undefined
                }
                onClick={canQuickView ? (e) => onRowActivate(e, item) : undefined}
                onKeyDown={
                  canQuickView
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onRowActivate(e, item);
                        }
                      }
                    : undefined
                }
                className={`${storefrontUi.card} flex items-start gap-3 border border-border p-4 shadow-product-card transition-all sm:items-center sm:gap-4 ${
                  canQuickView
                    ? 'cursor-pointer hover:bg-amber-50/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
                    : ''
                } ${isLoading ? 'opacity-70' : ''}`}
              >
                {image ? (
                   
                  <img
                    src={image}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded object-contain bg-[#f8f6f0]"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-secondary/40 text-xs text-muted-foreground">
                    —
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-y-1">
                    <p className="font-medium text-foreground">
                      {item.product?.name ?? 'Product'}
                    </p>
                    {item.quantity > 1 ? (
                      <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        ×{item.quantity}
                      </span>
                    ) : null}
                  </div>
                  {variantLabels.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {variantLabels.map((label, index) => (
                        <span
                          key={`${item.id}-${index}-${label}`}
                          className="inline-flex max-w-full items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium leading-4 text-muted-foreground"
                        >
                          <span className="truncate">{label}</span>
                        </span>
                      ))}
                    </div>
                  ) : item.variant?.name && item.variant.name !== item.product?.name ? (
                    <p className="mt-1 text-sm text-muted-foreground">{item.variant.name}</p>
                  ) : null}
                </div>

                <div className="mt-1 flex shrink-0 flex-col items-end gap-2 self-start sm:mt-0 sm:flex-row sm:items-center sm:gap-3 sm:self-center">
                  {listPrice != null ? (
                    <div className="text-right">
                      {item.quantity > 1 ? (
                        <div className="flex flex-wrap items-baseline justify-end gap-x-1.5 gap-y-0.5">
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {formatPrice(Number(listPrice) * item.quantity)}
                          </span>
                          <span className="text-xs font-normal tabular-nums text-muted-foreground">
                            ({formatPrice(Number(listPrice))} each)
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold tabular-nums text-primary">
                          {formatPrice(Number(listPrice))}
                        </span>
                      )}
                    </div>
                  ) : null}

                  {canQuickView ? (
                    <button
                      type="button"
                      suppressHydrationWarning
                      disabled={isLoading}
                      onClick={(e) => onRowActivate(e, item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-[var(--brand-purple-dark,var(--foreground))] transition-colors hover:border-[var(--brand-gold-primary,#d4af37)] hover:text-[var(--brand-gold-hover,#b89628)] disabled:opacity-60"
                      aria-label={`View details for ${item.product?.name ?? 'product'}`}
                    >
                      <EyeIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:inline">
                        {isLoading ? 'Loading…' : 'View Details'}
                      </span>
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {selectedProduct ? (
        <ProductQuickView
          product={selectedProduct}
          open={quickViewOpen}
          onClose={() => {
            setQuickViewOpen(false);
            setSelectedProduct(null);
          }}
        />
      ) : null}
    </>
  );
}

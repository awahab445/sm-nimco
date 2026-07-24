'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';
import { useCartStore } from '@/lib/cart.store';
import { useHydrated } from '@/lib/use-hydrated';
import { CartLineItemThumb } from '@/components/cart/cart-line-item-thumb';
import { formatPrice, APP_CURRENCY, resolveDisplayCurrency } from '@/lib/currency';
import { formatVariantAttributes } from '@/lib/format-variant-attributes';
import { storefrontUi } from '@/lib/storefront-ui';
import {
  useCartItemFallbackImages,
} from '@/lib/use-cart-item-fallback-images';
import type { CartBundleRow, CartItem } from '@/lib/api-client';

const PREVIEW_ITEM_LIMIT = 8;

type CartPreviewDropdownProps = {
  label?: string;
  href?: string;
  /** SM NIMCO purple/gold pill trigger with visible count text. */
  variant?: 'default' | 'sm-nimco';
};

function CartBundlePreviewLine({
  bundle,
  items,
  currency,
}: {
  bundle: CartBundleRow;
  items: CartItem[];
  currency: string;
}) {
  const quantity = bundle.quantity ?? 0;
  const unitPrice = bundle.dealUnitPrice ?? 0;
  const allBundleVariantChips = items
    .filter((item) => item.bundleGroupId === bundle.bundleGroupId && item.isBundleComponent)
    .flatMap((item) => formatVariantAttributes(item.variantAttributes ?? item.attributes ?? undefined))
    .filter((label) => label.trim().length > 0);
  const bundleVariantChips = allBundleVariantChips.slice(0, 3);
  const hiddenVariantCount = Math.max(0, allBundleVariantChips.length - 3);

  return (
    <li className="flex gap-3 border-b border-border py-4 last:border-0">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm bg-muted text-[10px] font-semibold uppercase tracking-wide text-foreground">
        Bundle
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {bundle.title?.trim() || 'Bundle deal'}
        </p>
        {bundleVariantChips.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {bundleVariantChips.map((chip, index) => (
              <span
                key={`${bundle.bundleGroupId}-${index}-${chip}`}
                className="inline-flex max-w-full items-center rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-4 text-muted-foreground"
              >
                <span className="truncate">{chip}</span>
              </span>
            ))}
            {hiddenVariantCount > 0 ? (
              <span className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-4 text-muted-foreground">
                +{hiddenVariantCount}
              </span>
            ) : null}
          </div>
        ) : null}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {quantity} × {formatPrice(unitPrice, currency)}
        </p>
      </div>
      <p className="shrink-0 text-sm font-medium text-foreground">
        {formatPrice(unitPrice * quantity, currency)}
      </p>
    </li>
  );
}

function CartPreviewLine({
  item,
  currency,
  fallbackProductImages,
}: {
  item: CartItem;
  currency: string;
  fallbackProductImages: Record<string, string>;
}) {
  const attrLines = formatVariantAttributes(item.variantAttributes ?? item.attributes ?? undefined);
  const subtitle =
    attrLines.length > 0
      ? attrLines.join(' · ')
      : item.variantName?.trim() || null;
  const quantity = item.quantity ?? 0;
  const unitPrice = item.price ?? 0;

  return (
    <li className="flex gap-3 border-b border-border py-4 last:border-0">
      <CartLineItemThumb
        item={item}
        fallbackProductImages={fallbackProductImages}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {item.productName?.trim() || 'Product'}
        </p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {quantity} × {formatPrice(unitPrice, currency)}
        </p>
      </div>
      <p className="shrink-0 text-sm font-medium text-foreground">
        {formatPrice(unitPrice * quantity, currency)}
      </p>
    </li>
  );
}

export function CartPreviewDropdown({
  label = 'Cart',
  href = '/cart',
  variant = 'default',
}: CartPreviewDropdownProps) {
  const hydrated = useHydrated();
  const titleId = useId();
  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);
  const refreshCart = useCartStore((s) => s.refreshCart);
  const items = cart?.items ?? [];
  const bundles = cart?.bundles ?? [];
  const fallbackProductImages = useCartItemFallbackImages(items);
  const cartItemCount =
    items.reduce((sum, i) => sum + (i.quantity ?? 0), 0) +
    bundles.reduce((sum, b) => sum + (b.quantity ?? 0), 0);
  const displayCurrency = resolveDisplayCurrency(cart?.currency ?? APP_CURRENCY);
  const subtotal =
    items.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 0), 0) +
    bundles.reduce((sum, b) => sum + (b.dealUnitPrice ?? 0) * (b.quantity ?? 0), 0);

  const [open, setOpen] = useState(false);
  const prevCountRef = useRef(0);
  const baselineReadyRef = useRef(false);
  const sawLoadingRef = useRef(false);
  const [badgePulse, setBadgePulse] = useState(false);

  // Auto-open on real add-to-cart count increases, but never on initial hydrate
  // (refresh loads cart 0 → N and must not slide the tray open).
  useEffect(() => {
    if (isLoading) {
      sawLoadingRef.current = true;
      return;
    }

    if (!baselineReadyRef.current) {
      const cartId = useCartStore.getState().getCartId();
      // Stored cart exists but fetch has not started/finished yet — keep waiting.
      if (cartId && cart === null && !sawLoadingRef.current) {
        return;
      }
      prevCountRef.current = cartItemCount;
      baselineReadyRef.current = true;
      return;
    }

    if (cartItemCount <= prevCountRef.current) {
      prevCountRef.current = cartItemCount;
      return;
    }
    prevCountRef.current = cartItemCount;
    const startPulse = window.setTimeout(() => {
      setBadgePulse(true);
      setOpen(true);
      window.setTimeout(() => setBadgePulse(false), 500);
    }, 0);
    return () => window.clearTimeout(startPulse);
  }, [cartItemCount, isLoading, cart]);

  const closeDrawer = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (open) {
      void refreshCart();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeDrawer();
      };
      document.addEventListener('keydown', onKey);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open, refreshCart, closeDrawer]);

  const previewRows = [
    ...bundles.map((bundle) => ({
      type: 'bundle' as const,
      key: `bundle-${bundle.bundleGroupId}`,
      bundle,
    })),
    ...items.map((item) => ({
      type: 'item' as const,
      key: item.variantId || `item-${item.productId}`,
      item,
    })),
  ];
  const previewSlice = previewRows.slice(0, PREVIEW_ITEM_LIMIT);
  const hiddenCount = Math.max(0, previewRows.length - PREVIEW_ITEM_LIMIT);
  const isEmpty = items.length === 0 && bundles.length === 0;

  const drawer =
    hydrated && open ? (
      <div className="fixed inset-0 z-[200] flex justify-end" role="presentation">
        <button
          type="button"
          className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
          aria-label="Close cart"
          onClick={closeDrawer}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="header-cart-preview relative flex h-full w-full max-w-md flex-col bg-card text-foreground shadow-product-card animate-[plp-sheet-enter_0.28s_ease-out]"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p id={titleId} className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              {variant === 'sm-nimco'
                ? 'Your Shopping Cart'
                : cartItemCount > 0
                  ? `Shopping cart (${cartItemCount})`
                  : 'Shopping cart'}
            </p>
            <button
              type="button"
              className="rounded-sm p-2 text-foreground transition-colors hover:text-primary-hover"
              aria-label="Close cart"
              onClick={closeDrawer}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
            {isLoading && isEmpty ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
            ) : isEmpty ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                <Link
                  href="/products"
                  className={`mt-4 inline-block ${storefrontUi.btnPrimary}`}
                  onClick={closeDrawer}
                >
                  Continue shopping
                </Link>
              </div>
            ) : (
              <>
                <ul>
                  {previewSlice.map((row) =>
                    row.type === 'bundle' ? (
                      <CartBundlePreviewLine
                        key={row.key}
                        bundle={row.bundle}
                        items={items}
                        currency={displayCurrency}
                      />
                    ) : (
                      <CartPreviewLine
                        key={row.key}
                        item={row.item}
                        currency={displayCurrency}
                        fallbackProductImages={fallbackProductImages}
                      />
                    ),
                  )}
                </ul>
                {hiddenCount > 0 ? (
                  <p className="py-3 text-xs text-muted-foreground">
                    +{hiddenCount} more in cart
                  </p>
                ) : null}
              </>
            )}
          </div>

          {!isEmpty ? (
            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="uppercase tracking-wide text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(subtotal, displayCurrency)}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={href}
                  className={`${storefrontUi.btnSecondary} w-full py-3 text-center`}
                  onClick={closeDrawer}
                >
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  className={
                    variant === 'sm-nimco'
                      ? 'mt-0 w-full rounded-xl bg-[var(--brand-purple-dark,#1e1035)] py-3 text-center text-sm font-bold text-[var(--brand-gold-primary,#d4af37)] transition-colors hover:bg-[var(--brand-purple-deep,#2e1a47)]'
                      : `${storefrontUi.btnPrimaryCheckout} mt-0 w-full py-3 text-center`
                  }
                  onClick={closeDrawer}
                >
                  {variant === 'sm-nimco' ? 'Checkout Now' : 'Checkout'}
                </Link>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        suppressHydrationWarning
        className={
          variant === 'sm-nimco'
            ? 'header-cart-trigger relative inline-flex items-center space-x-2 rounded-xl bg-[var(--brand-purple-dark,#1e1035)] px-4 py-2 text-[var(--brand-gold-primary,#d4af37)] shadow transition-colors hover:bg-[var(--brand-purple-deep,#2e1a47)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
            : 'header-cart-trigger site-header__icon-btn relative inline-flex items-center justify-center text-foreground transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
        }
        aria-label={
          cartItemCount > 0
            ? `${label}, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`
            : label
        }
        title={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {variant === 'sm-nimco' ? (
          <>
            <ShoppingBagIcon
              className="h-4 w-4 shrink-0 text-[var(--brand-gold-primary,#d4af37)]"
              aria-hidden
            />
            <span className="text-xs font-bold text-[var(--brand-gold-primary,#d4af37)]">
              Cart ({hydrated ? cartItemCount : 0})
            </span>
          </>
        ) : (
          <span className="relative inline-flex h-[22px] w-[22px] items-center justify-center [&_.cart-icon]:text-inherit">
            <ShoppingBagIcon className="h-[22px] w-[22px] shrink-0" aria-hidden />
            {hydrated ? (
              <span
                className={`chrome-count-box ${badgePulse ? 'chrome-cart-badge--pulse' : ''}`}
                aria-hidden
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            ) : null}
          </span>
        )}
      </button>
      {hydrated && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}

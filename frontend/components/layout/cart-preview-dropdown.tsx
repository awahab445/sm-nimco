'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';
import { useCartStore } from '@/lib/cart.store';
import { useHydrated } from '@/lib/use-hydrated';
import { CartLineItemThumb } from '@/components/cart/cart-line-item-thumb';
import { formatPrice, APP_CURRENCY } from '@/lib/currency';
import { formatVariantAttributes } from '@/lib/format-variant-attributes';
import { storefrontUi } from '@/lib/storefront-ui';
import {
  useCartItemFallbackImages,
} from '@/lib/use-cart-item-fallback-images';
import type { CartBundleRow, CartItem } from '@/lib/api-client';

const CLOSE_MS = 180;
const PREVIEW_ITEM_LIMIT = 5;

type CartPreviewDropdownProps = {
  label?: string;
  href?: string;
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
    <li className="flex gap-3 py-2.5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/50 text-[10px] font-semibold uppercase tracking-wide text-primary">
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
                className="inline-flex max-w-full items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-4 text-muted-foreground"
              >
                <span className="truncate">{chip}</span>
              </span>
            ))}
            {hiddenVariantCount > 0 ? (
              <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-4 text-muted-foreground">
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
    <li className="flex gap-3 py-2.5">
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

export function CartPreviewDropdown({ label = 'Cart', href = '/cart' }: CartPreviewDropdownProps) {
  const hydrated = useHydrated();
  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);
  const refreshCart = useCartStore((s) => s.refreshCart);
  const items = cart?.items ?? [];
  const bundles = cart?.bundles ?? [];
  const fallbackProductImages = useCartItemFallbackImages(items);
  const cartItemCount =
    items.reduce((sum, i) => sum + (i.quantity ?? 0), 0) +
    bundles.reduce((sum, b) => sum + (b.quantity ?? 0), 0);
  const displayCurrency = cart?.currency ?? APP_CURRENCY;
  const subtotal =
    items.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 0), 0) +
    bundles.reduce((sum, b) => sum + (b.dealUnitPrice ?? 0) * (b.quantity ?? 0), 0);

  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCountRef = useRef(cartItemCount);
  const [badgePulse, setBadgePulse] = useState(false);

  useEffect(() => {
    if (cartItemCount <= prevCountRef.current) {
      prevCountRef.current = cartItemCount;
      return;
    }
    prevCountRef.current = cartItemCount;
    const startPulse = window.setTimeout(() => {
      setBadgePulse(true);
      window.setTimeout(() => setBadgePulse(false), 500);
    }, 0);
    return () => window.clearTimeout(startPulse);
  }, [cartItemCount]);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_MS);
  }, [cancelClose, setOpen]);

  const openPreview = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose, setOpen]);

  useEffect(() => {
    if (open) {
      void refreshCart();
    }
  }, [open, refreshCart]);

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

  return (
    <div
      className="group relative hidden self-stretch items-center overflow-visible lg:flex"
      onMouseEnter={openPreview}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={href}
        className="header-cart-trigger relative inline-flex h-full items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        aria-label={
          cartItemCount > 0
            ? `${label}, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`
            : label
        }
        title={label}
        onMouseEnter={openPreview}
        onFocus={openPreview}
        onBlur={scheduleClose}
      >
        <span className="relative inline-flex h-6 w-6 items-center justify-center [&_.cart-icon]:text-inherit">
          <ShoppingBagIcon className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />
          {hydrated && cartItemCount > 0 ? (
            <span
              className={`pointer-events-none absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold leading-none text-destructive-foreground ring-2 ring-brand-primary ${badgePulse ? 'chrome-cart-badge--pulse' : ''}`}
              aria-hidden
            >
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          ) : null}
        </span>
      </Link>

      {hydrated && open ? (
        <div
          role="region"
          aria-label="Cart preview"
          className="header-cart-preview pointer-events-auto absolute right-0 top-full z-[120] mt-0.5 w-[min(100vw-2rem,22rem)] shadow-lg"
          onMouseEnter={openPreview}
          onMouseLeave={scheduleClose}
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              {cartItemCount > 0
                ? `Your cart (${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'})`
                : 'Your cart'}
            </p>
          </div>

          {isLoading && isEmpty ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : isEmpty ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              <Link
                href="/products"
                className={`mt-3 inline-block text-sm ${storefrontUi.btnPrimary}`}
                onClick={() => setOpen(false)}
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <>
              <ul className="max-h-[min(16rem,40vh)] divide-y divide-border overflow-y-auto overscroll-contain px-4">
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
                <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
                  +{hiddenCount} more in cart
                </p>
              ) : null}
              <div className="border-t border-border px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(subtotal, displayCurrency)}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href={href}
                    className={`${storefrontUi.btnPrimary} w-full py-2 text-center text-sm`}
                    onClick={() => setOpen(false)}
                  >
                    View cart
                  </Link>
                  <Link
                    href="/checkout"
                    className={`${storefrontUi.btnPrimaryCheckout} mt-0 w-full py-2 text-center text-sm`}
                    onClick={() => setOpen(false)}
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

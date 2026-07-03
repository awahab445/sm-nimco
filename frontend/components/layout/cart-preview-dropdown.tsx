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
import type { CartItem } from '@/lib/api-client';

const CLOSE_MS = 180;
const PREVIEW_ITEM_LIMIT = 5;

type CartPreviewDropdownProps = {
  label?: string;
  href?: string;
};

function CartPreviewLine({
  item,
  currency,
  fallbackProductImages,
}: {
  item: CartItem;
  currency: string;
  fallbackProductImages: Record<string, string>;
}) {
  const attrLines = formatVariantAttributes(item.variantAttributes ?? item.attributes);
  const subtitle =
    attrLines.length > 0
      ? attrLines.join(' · ')
      : item.variantName?.trim() || null;

  return (
    <li className="flex gap-3 py-2.5">
      <CartLineItemThumb
        item={item}
        fallbackProductImages={fallbackProductImages}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {item.productName ?? 'Product'}
        </p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.quantity} × {formatPrice(item.price, currency)}
        </p>
      </div>
      <p className="shrink-0 text-sm font-medium text-foreground">
        {formatPrice(item.price * item.quantity, currency)}
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
  const fallbackProductImages = useCartItemFallbackImages(items);
  const cartItemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const displayCurrency = cart?.currency ?? APP_CURRENCY;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_MS);
  }, [cancelClose]);

  const openPreview = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  useEffect(() => {
    if (open) {
      void refreshCart();
    }
  }, [open, refreshCart]);

  const previewItems = items.slice(0, PREVIEW_ITEM_LIMIT);
  const hiddenCount = Math.max(0, items.length - PREVIEW_ITEM_LIMIT);

  return (
    <div
      className="relative hidden self-stretch items-center overflow-visible lg:flex"
      onMouseEnter={openPreview}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={href}
        className="header-cart-trigger relative inline-flex h-full items-center justify-center text-white transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
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
        <span className="relative inline-flex h-6 w-6 items-center justify-center text-white [&_.cart-icon]:text-white">
          <ShoppingBagIcon className="h-6 w-6 shrink-0 text-white" strokeWidth={2} aria-hidden />
          {hydrated && cartItemCount > 0 ? (
            <span
              className="pointer-events-none absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold leading-none text-white ring-2 ring-brand-primary"
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
          className="header-cart-preview absolute right-0 top-full z-[120] mt-0.5 w-[min(100vw-2rem,22rem)]"
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

          {isLoading && items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
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
                {previewItems.map((item) => (
                  <CartPreviewLine
                    key={item.variantId}
                    item={item}
                    currency={displayCurrency}
                    fallbackProductImages={fallbackProductImages}
                  />
                ))}
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

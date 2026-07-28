'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';
import { useCartStore } from '@/lib/cart.store';
import { useHydrated } from '@/lib/use-hydrated';
import { formatPrice, APP_CURRENCY, resolveDisplayCurrency } from '@/lib/currency';
import { storeSettingsApi } from '@/lib/api-client';
import { CartThresholdProgress } from '@/components/cart/cart-threshold-progress';

const DEFAULT_MIN_ORDER_VALUE = 800;
const DEFAULT_FREE_DELIVERY = 2000;
const MINI_CART_HEIGHT_VAR = '--mobile-mini-cart-height';
/** Bar body + compact progress strip (keeps sticky ATC / WhatsApp clearances in sync). */
const MINI_CART_VISIBLE_HEIGHT = '4.15rem';

function pathBlocked(pathname: string): boolean {
  const p = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return p === '/cart' || p === '/checkout' || p.startsWith('/checkout/');
}

/**
 * Sticky mobile cart summary above the bottom toolbar when the cart has items.
 */
export function MobileMiniCartBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cart = useCartStore((s) => s.cart);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(DEFAULT_MIN_ORDER_VALUE);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(DEFAULT_FREE_DELIVERY);

  const items = cart?.items ?? [];
  const bundles = cart?.bundles ?? [];
  const cartItemCount =
    items.reduce((sum, i) => sum + (i.quantity ?? 0), 0) +
    bundles.reduce((sum, b) => sum + (b.quantity ?? 0), 0);
  const subtotal =
    items.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 0), 0) +
    bundles.reduce((sum, b) => sum + (b.dealUnitPrice ?? 0) * (b.quantity ?? 0), 0);
  const displayCurrency = resolveDisplayCurrency(cart?.currency ?? APP_CURRENCY);
  const cartId = cart?.id ?? null;
  const meetsMinimumOrder = subtotal >= minimumOrderAmount;
  const checkoutHref =
    cartId && meetsMinimumOrder
      ? `/checkout?cartId=${encodeURIComponent(cartId)}`
      : '/cart';

  const visible =
    hydrated && cartItemCount > 0 && typeof pathname === 'string' && !pathBlocked(pathname);

  useEffect(() => {
    let cancelled = false;
    storeSettingsApi
      .getStoreSettings()
      .then((res) => {
        if (cancelled) return;
        const minOrder = Number(res.data.minimumOrderAmount);
        const freeDelivery = Number(res.data.freeDeliveryThreshold);
        if (Number.isFinite(minOrder) && minOrder > 0) {
          setMinimumOrderAmount(minOrder);
        }
        if (Number.isFinite(freeDelivery) && freeDelivery >= 0) {
          setFreeDeliveryThreshold(freeDelivery);
        }
      })
      .catch(() => {
        /* keep default */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(
      MINI_CART_HEIGHT_VAR,
      visible ? MINI_CART_VISIBLE_HEIGHT : '0px',
    );
    return () => {
      document.documentElement.style.setProperty(MINI_CART_HEIGHT_VAR, '0px');
    };
  }, [visible]);

  if (!visible) return null;

  return createPortal(
    <div
      className="mobile-mini-cart-bar fixed inset-x-0 z-[92] border-t border-[color-mix(in_srgb,var(--brand-gold-primary,#d4af37)_25%,transparent)] bg-[var(--brand-purple-dark,#1e1035)] text-[var(--brand-gold-primary,#d4af37)] shadow-[0_-4px_20px_rgba(0,0,0,0.18)] lg:hidden"
      style={{ bottom: 'calc(3.4375rem + env(safe-area-inset-bottom, 0px))' }}
      role="region"
      aria-label="Cart summary"
    >
      <CartThresholdProgress
        subtotal={subtotal}
        currency={displayCurrency}
        minimumOrderAmount={minimumOrderAmount}
        freeDeliveryThreshold={freeDeliveryThreshold}
        compact
      />
      <div className="mx-auto flex h-[3.25rem] max-w-7xl items-center gap-3 px-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-gold-primary,#d4af37)]/15">
            <ShoppingBagIcon className="h-4 w-4" strokeWidth={1.6} aria-hidden />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-gold-primary,#d4af37)] px-0.5 text-[10px] font-bold leading-none text-[var(--brand-purple-dark,#1e1035)]">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[var(--brand-gold-primary,#d4af37)]/80">
              {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
            </p>
            <p className="truncate text-sm font-bold text-[var(--brand-gold-primary,#d4af37)]">
              {formatPrice(subtotal, displayCurrency)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/cart"
            className="rounded-lg border border-[var(--brand-gold-primary,#d4af37)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--brand-gold-primary,#d4af37)] transition-colors hover:bg-white/5"
          >
            View cart
          </Link>
          <Link
            href={checkoutHref}
            className="rounded-lg bg-[var(--brand-gold-primary,#d4af37)] px-3 py-1.5 text-xs font-bold text-[var(--brand-purple-dark,#1e1035)] transition-colors hover:bg-[var(--brand-gold-hover,#b89628)]"
          >
            {meetsMinimumOrder ? 'Checkout' : 'Add more'}
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}

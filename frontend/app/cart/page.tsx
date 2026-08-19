'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart.store';
import { useAuthStore } from '@/lib/auth.store';
import { formatPrice, APP_CURRENCY, resolveDisplayCurrency } from '@/lib/currency';
import { CartLineItemThumb } from '@/components/cart/cart-line-item-thumb';
import { CartShippingEstimate } from '@/components/cart/cart-shipping-estimate';
import { CouponApplySection } from '@/components/coupon/coupon-apply-section';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';
import {
  cartItemsToValidateItems,
  clearPendingCouponCode,
  getPendingCouponCode,
  setPendingCouponCode,
  validateCouponCodeForCartLike,
} from '@/lib/coupon-sync';
import { formatVariantAttributes } from '@/lib/format-variant-attributes';
import { storefrontUi } from '@/lib/storefront-ui';
import { useCartItemFallbackImages } from '@/lib/use-cart-item-fallback-images';
import { cartItemToGa4Item, trackViewCart } from '@/lib/analytics';
import { storeSettingsApi } from '@/lib/api-client';
import {
  getAvailableStockFromError,
  getCartQtyStockErrorMessage,
} from '@/lib/cart-errors';
import { showStorefrontToast } from '@/lib/storefront-toast';

const DEFAULT_MIN_ORDER_VALUE = 800;

export default function CartPage() {
  const { cart, isLoading, error, refreshCart, updateItem, removeItem, updateBundle, removeBundle, clearCart } =
    useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const customerId = isAuthenticated ? user?.id : undefined;
  const customerGroupId = isAuthenticated ? user?.customerGroupId : undefined;
  const [localQty, setLocalQty] = useState<Record<string, number>>({});
  const [couponMeta, setCouponMeta] = useState<{
    code: string | null;
    discountAmount: number;
    isFreeShipping: boolean;
  }>({ code: null, discountAmount: 0, isFreeShipping: false });
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(DEFAULT_MIN_ORDER_VALUE);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    let cancelled = false;
    storeSettingsApi
      .getStoreSettings()
      .then((res) => {
        if (cancelled) return;
        const minOrder = Number(res.data.minimumOrderAmount);
        if (Number.isFinite(minOrder) && minOrder >= 0) {
          setMinimumOrderAmount(minOrder);
        }
      })
      .catch(() => {
        // Keep default when settings cannot be loaded.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const items = cart?.items ?? [];
    if (items.length === 0) return;
    trackViewCart(items.map(cartItemToGa4Item));
  }, [cart?.items]);

  useEffect(() => {
    const items = cart?.items ?? [];
    const next: Record<string, number> = {};
    items.forEach((i) => {
      next[i.variantId] = i.quantity;
    });
    const id = requestAnimationFrame(() => setLocalQty(next));
    return () => cancelAnimationFrame(id);
  }, [cart?.items]);

  const items = cart?.items ?? [];
  const bundles = cart?.bundles ?? [];
  const fallbackProductImages = useCartItemFallbackImages(items);
  const bundleSubtotal = bundles.reduce((sum, b) => sum + b.dealUnitPrice * b.quantity, 0);
  const itemSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const subtotal = bundleSubtotal + itemSubtotal;
  const totalUnits =
    items.reduce((sum, i) => sum + i.quantity, 0) +
    bundles.reduce((sum, b) => sum + b.quantity, 0);
  const cartId = cart?.id ?? null;
  const displayCurrency = resolveDisplayCurrency(cart?.currency ?? APP_CURRENCY);
  const meetsMinimumOrder = subtotal >= minimumOrderAmount;

  useEffect(() => {
    const lineItems = cart?.items ?? [];
    const bundleRows = cart?.bundles ?? [];
    const code = getPendingCouponCode();
    const sub =
      lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0) +
      bundleRows.reduce((sum, b) => sum + b.dealUnitPrice * b.quantity, 0);

    if (!code) {
      const id = requestAnimationFrame(() => {
        setCouponMeta((prev) =>
          prev.code === null && prev.discountAmount === 0 && prev.isFreeShipping === false
            ? prev
            : { code: null, discountAmount: 0, isFreeShipping: false },
        );
      });
      return () => cancelAnimationFrame(id);
    }
    if (lineItems.length === 0 && bundleRows.length === 0) {
      const id = requestAnimationFrame(() => {
        setCouponMeta((prev) =>
          prev.code === code && prev.discountAmount === 0 && prev.isFreeShipping === false
            ? prev
            : { code, discountAmount: 0, isFreeShipping: false },
        );
      });
      return () => cancelAnimationFrame(id);
    }
    let cancelled = false;
    validateCouponCodeForCartLike({
      code,
      subtotal: sub,
      items: cartItemsToValidateItems(lineItems),
      customerId,
      customerGroupId,
    }).then((v) => {
      if (cancelled) return;
      if (v.ok) {
        setCouponMeta((prev) => {
          const next = {
            code: v.appliedCode,
            discountAmount: v.discountAmount,
            isFreeShipping: v.isFreeShipping,
          };
          if (
            prev.code === next.code &&
            prev.discountAmount === next.discountAmount &&
            prev.isFreeShipping === next.isFreeShipping
          ) {
            return prev;
          }
          return next;
        });
      } else {
        clearPendingCouponCode();
        setCouponMeta((prev) =>
          prev.code === null && prev.discountAmount === 0 && prev.isFreeShipping === false
            ? prev
            : { code: null, discountAmount: 0, isFreeShipping: false },
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cart?.items, cart?.bundles, customerId, customerGroupId]);

  const handleQtyBlur = async (variantId: string) => {
    const previous =
      cart?.items.find((item) => item.variantId === variantId)?.quantity ?? 1;
    const q = Math.max(1, localQty[variantId] ?? previous);
    if (q === previous) return;

    try {
      await updateItem(variantId, q);
      await refreshCart();
    } catch (err: unknown) {
      const available = getAvailableStockFromError(err);

      if (available != null && available >= 1) {
        setLocalQty((prev) => ({ ...prev, [variantId]: available }));
        showStorefrontToast(getCartQtyStockErrorMessage(available), 'error');
        try {
          await updateItem(variantId, available);
          await refreshCart();
        } catch {
          setLocalQty((prev) => ({ ...prev, [variantId]: previous }));
        }
        return;
      }

      setLocalQty((prev) => ({ ...prev, [variantId]: previous }));
      const message =
        available === 0
          ? getCartQtyStockErrorMessage(0)
          : err instanceof Error && err.message.trim()
            ? err.message
            : 'Failed to update quantity.';
      showStorefrontToast(message, 'error');
    }
  };

  if (isLoading && !cart) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" aria-hidden />
          <p className="mt-4 text-muted-foreground">Loading cart…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-border/60 pb-6">
        <h1 className="font-display flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          <ShoppingBagIcon className="h-7 w-7 shrink-0 text-foreground" strokeWidth={1.2} aria-hidden />
          Your cart
        </h1>
        {totalUnits > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {totalUnits} {totalUnits === 1 ? 'item' : 'items'} in your cart
          </p>
        ) : null}
      </div>

      {error && (
        <div className={`mt-4 ${storefrontUi.alertError}`}>
          {error}
        </div>
      )}

      {items.length === 0 && bundles.length === 0 && !isLoading ? (
        <div className="mt-8 py-16 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link
            href="/products"
            className={`mt-4 inline-block ${storefrontUi.btnPrimary}`}
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <div className={`${storefrontUi.card} overflow-hidden`}>
              <div className="border-b border-border/60 px-4 py-3 sm:px-6">
                <h2 className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Cart items
                </h2>
              </div>
              <ul className="divide-y divide-border/60">
              {bundles.map((bundle) => {
                const rowTotal = bundle.dealUnitPrice * bundle.quantity;
                const allBundleVariantChips = items
                  .filter((item) => item.bundleGroupId === bundle.bundleGroupId && item.isBundleComponent)
                  .flatMap((item) =>
                    formatVariantAttributes(item.variantAttributes ?? item.attributes ?? undefined),
                  )
                  .filter((label) => label.trim().length > 0);
                const bundleVariantChips = allBundleVariantChips.slice(0, 5);
                const extraChipCount = Math.max(0, allBundleVariantChips.length - bundleVariantChips.length);
                return (
                  <li key={bundle.bundleGroupId} className="flex flex-wrap items-center gap-4 px-4 py-5 sm:px-6">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm bg-muted text-xs font-medium uppercase tracking-wide text-foreground">
                      Bundle
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{bundle.title}</p>
                      {bundleVariantChips.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {bundleVariantChips.map((chip, chipIndex) => (
                            <span
                              key={`${bundle.bundleGroupId}-${chipIndex}-${chip}`}
                              className="inline-flex max-w-full items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium leading-4 text-muted-foreground"
                            >
                              <span className="truncate">{chip}</span>
                            </span>
                          ))}
                          {extraChipCount > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium leading-4 text-muted-foreground">
                              +{extraChipCount}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <Link href={`/deals/${bundle.slug}`} className={`text-sm ${storefrontUi.link}`}>
                        View deal
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPrice(bundle.dealUnitPrice, displayCurrency)} per bundle
                      </p>
                    </div>
                    <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                      <p className="text-sm font-semibold text-foreground sm:hidden">
                        {formatPrice(rowTotal, displayCurrency)}
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          className="w-16 rounded-sm border border-input bg-card px-2 py-1.5 text-center text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/40"
                          defaultValue={bundle.quantity}
                          onBlur={(e) => {
                            const q = Math.max(1, Number(e.target.value) || 1);
                            void updateBundle(bundle.bundleGroupId, q).then(() => refreshCart());
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => void removeBundle(bundle.bundleGroupId).then(() => refreshCart())}
                          className="text-sm text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="hidden text-sm font-semibold text-foreground sm:block">
                        {formatPrice(rowTotal, displayCurrency)}
                      </p>
                    </div>
                  </li>
                );
              })}
              {items.map((item) => {
                const rowTotal = item.price * item.quantity;
                const attrLines = formatVariantAttributes(item.variantAttributes ?? item.attributes);
                return (
                <li key={item.variantId} className="flex flex-wrap items-center gap-4 px-4 py-5 sm:px-6">
                  <CartLineItemThumb
                    item={item}
                    fallbackProductImages={fallbackProductImages}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {item.productName ?? 'Product'}
                    </p>
                    {attrLines.length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {attrLines.map((line, lineIndex) => (
                          <span
                            key={`${item.variantId}-${lineIndex}-${line}`}
                            className="inline-flex max-w-full items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium leading-4 text-muted-foreground"
                          >
                            <span className="truncate">{line}</span>
                          </span>
                        ))}
                      </div>
                    ) : item.variantName ? (
                      <p className="mt-1 text-sm text-muted-foreground">{item.variantName}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(item.price, displayCurrency)} each
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    <p className="text-sm font-semibold text-foreground sm:hidden">
                      {formatPrice(rowTotal, displayCurrency)}
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="sr-only" htmlFor={`qty-${item.variantId}`}>
                        Quantity for {item.productName ?? 'product'}
                      </label>
                      <input
                        id={`qty-${item.variantId}`}
                        type="number"
                        min={1}
                        value={localQty[item.variantId] ?? item.quantity}
                        onChange={(e) => {
                          const q = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setLocalQty((prev) => ({ ...prev, [item.variantId]: q }));
                        }}
                        onBlur={() => handleQtyBlur(item.variantId)}
                        className="w-16 rounded-sm border border-input bg-card px-2 py-1.5 text-center text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/40"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className={storefrontUi.btnDestructive}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="hidden min-w-[5.5rem] text-right text-sm font-semibold text-foreground sm:block">
                      {formatPrice(rowTotal, displayCurrency)}
                    </p>
                  </div>
                </li>
              );
              })}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => clearCart()}
              className={`mt-4 ${storefrontUi.btnDestructive} px-4 py-2`}
            >
              Clear cart
            </button>
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="sticky top-24 space-y-4">
              <div className={`${storefrontUi.card} p-6`}>
              <h2 className="font-display border-b border-border/60 pb-3 text-lg font-semibold tracking-tight text-foreground">
                Order summary
              </h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(subtotal, displayCurrency)}
                  </span>
                </div>
              {couponMeta.discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                  <span>Discount</span>
                  <span className="font-medium">−{formatPrice(couponMeta.discountAmount, displayCurrency)}</span>
                </div>
              )}
              {couponMeta.isFreeShipping && couponMeta.discountAmount <= 0 && couponMeta.code && (
                <p className="text-muted-foreground">
                  Free shipping coupon — savings shown at checkout.
                </p>
              )}
              {(couponMeta.discountAmount > 0 || (couponMeta.isFreeShipping && couponMeta.code)) && (
                <div className="flex items-center justify-between border-t border-border/60 pt-2 font-semibold text-foreground">
                  <span>Estimated total</span>
                  <span>
                    {formatPrice(Math.max(0, subtotal - couponMeta.discountAmount), displayCurrency)}
                  </span>
                </div>
              )}
              </div>
              {!meetsMinimumOrder && items.length + bundles.length > 0 ? (
                <p className="mt-3 rounded-sm bg-secondary/50 px-3 py-2 text-xs font-medium text-foreground">
                  A minimum order of {formatPrice(minimumOrderAmount, displayCurrency)} is required
                  to checkout. Add{' '}
                  {formatPrice(Math.max(0, minimumOrderAmount - subtotal), displayCurrency)} more to
                  continue.
                </p>
              ) : null}
              <div className="mt-4">
                <CouponApplySection
                  appliedCouponCode={couponMeta.code}
                  subtotal={subtotal}
                  items={cartItemsToValidateItems(items)}
                  customerId={customerId}
                  customerGroupId={customerGroupId}
                  disabled={items.length === 0}
                  onValidatedApply={async (code, meta) => {
                    setPendingCouponCode(code);
                    setCouponMeta({
                      code,
                      discountAmount: meta.discountAmount,
                      isFreeShipping: meta.isFreeShipping,
                    });
                  }}
                  onRemove={async () => {
                    clearPendingCouponCode();
                    setCouponMeta({ code: null, discountAmount: 0, isFreeShipping: false });
                  }}
                />
              </div>
              {meetsMinimumOrder ? (
                <Link
                  href={cartId ? `/checkout?cartId=${cartId}` : '/cart'}
                  className={`mt-4 block text-center ${storefrontUi.btnPrimaryCheckout}`}
                >
                  Proceed to checkout
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className={`mt-4 block w-full text-center opacity-60 ${storefrontUi.btnPrimaryCheckout}`}
                >
                  Proceed to checkout
                </button>
              )}
            </div>
              <CartShippingEstimate
                items={items}
                subtotal={subtotal}
                currency={displayCurrency}
                customerGroupId={customerGroupId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

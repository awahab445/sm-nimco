'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart.store';
import { useAuthStore } from '@/lib/auth.store';
import { formatPrice, APP_CURRENCY } from '@/lib/currency';
import { CartLineItemThumb } from '@/components/cart/cart-line-item-thumb';
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

  useEffect(() => {
    document.title = 'Your cart | E-commerce';
    return () => { document.title = 'E-commerce'; };
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

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
    setLocalQty(next);
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
  const displayCurrency = cart?.currency ?? APP_CURRENCY;

  useEffect(() => {
    const lineItems = cart?.items ?? [];
    const bundleRows = cart?.bundles ?? [];
    const code = getPendingCouponCode();
    const sub =
      lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0) +
      bundleRows.reduce((sum, b) => sum + b.dealUnitPrice * b.quantity, 0);

    if (!code) {
      setCouponMeta((prev) =>
        prev.code === null && prev.discountAmount === 0 && prev.isFreeShipping === false
          ? prev
          : { code: null, discountAmount: 0, isFreeShipping: false },
      );
      return;
    }
    if (lineItems.length === 0 && bundleRows.length === 0) {
      setCouponMeta((prev) =>
        prev.code === code && prev.discountAmount === 0 && prev.isFreeShipping === false
          ? prev
          : { code, discountAmount: 0, isFreeShipping: false },
      );
      return;
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
    const q = Math.max(1, localQty[variantId] ?? 1);
    await updateItem(variantId, q);
    await refreshCart();
  };

  if (isLoading && !cart) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-24 shadow-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" aria-hidden />
          <p className="mt-4 text-muted-foreground">Loading cart…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <ShoppingBagIcon className="h-7 w-7 shrink-0 text-primary" strokeWidth={2} aria-hidden />
          Your cart
        </h1>
        {totalUnits > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {totalUnits} {totalUnits === 1 ? 'item' : 'items'} in your cart
          </p>
        ) : null}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {items.length === 0 && bundles.length === 0 && !isLoading ? (
        <div className="mt-8 rounded-xl border border-border bg-card py-16 text-center shadow-sm">
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
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Cart items
                </h2>
              </div>
              <ul className="divide-y divide-border">
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
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-xs font-medium text-primary">
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
                      <Link href={`/deals/${bundle.slug}`} className="text-sm text-primary hover:underline">
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
                          className="w-16 rounded-md border border-input bg-card px-2 py-1 text-sm"
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
                        className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-center text-sm text-foreground shadow-sm"
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
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="border-b border-border pb-3 text-lg font-semibold text-foreground">
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
                <div className="flex items-center justify-between border-t border-border pt-2 font-semibold text-foreground">
                  <span>Estimated total</span>
                  <span>
                    {formatPrice(Math.max(0, subtotal - couponMeta.discountAmount), displayCurrency)}
                  </span>
                </div>
              )}
              </div>
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
              <Link
                href={cartId ? `/checkout?cartId=${cartId}` : '/cart'}
                className={`mt-4 block text-center ${storefrontUi.btnPrimaryCheckout}`}
              >
                Proceed to checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

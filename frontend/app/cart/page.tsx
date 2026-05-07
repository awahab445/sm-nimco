'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart.store';
import { productApi } from '@/lib/api-client';
import { DEFAULT_CURRENCY } from '@/lib/config';
import { resolveImageUrl } from '@/lib/resolve-image-url';

function formatPrice(value: number, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

function formatVariantAttributes(attrs: Record<string, unknown> | undefined): string[] {
  if (!attrs || typeof attrs !== 'object') return [];
  return Object.entries(attrs)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => {
      const key = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim();
      const value = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return `${key}: ${value}`;
    });
}

export default function CartPage() {
  const { cart, isLoading, error, refreshCart, updateItem, removeItem, clearCart } =
    useCartStore();
  const [localQty, setLocalQty] = useState<Record<string, number>>({});
  const [fallbackProductImages, setFallbackProductImages] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = 'Your cart | E-commerce';
    return () => { document.title = 'E-commerce'; };
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    const items = cart?.items ?? [];
    const next: Record<string, number> = {};
    items.forEach((i) => {
      next[i.variantId] = i.quantity;
    });
    setLocalQty(next);
  }, [cart?.items]);

  useEffect(() => {
    const items = cart?.items ?? [];
    const missingProductIds = Array.from(
      new Set(
        items
          .filter((item) => !item.productImage && !!item.productId && !fallbackProductImages[item.productId])
          .map((item) => item.productId),
      ),
    );
    if (missingProductIds.length === 0) return;

    let cancelled = false;
    Promise.all(
      missingProductIds.map(async (productId) => {
        try {
          const product = await productApi.getProductById(productId);
          const primary = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
          return { productId, image: primary?.url ?? '' };
        } catch {
          return { productId, image: '' };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setFallbackProductImages((prev) => {
        const next = { ...prev };
        for (const r of results) {
          next[r.productId] = r.image;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [cart?.items, fallbackProductImages]);

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartId = cart?.id ?? null;

  const handleQtyBlur = async (variantId: string) => {
    const q = Math.max(1, localQty[variantId] ?? 1);
    await updateItem(variantId, q);
    await refreshCart();
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
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Your cart
      </h1>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {items.length === 0 && !isLoading ? (
        <div className="mt-8 rounded-lg border border-border bg-muted/50 py-16 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const rowTotal = item.price * item.quantity;
                const attrLines = formatVariantAttributes(item.variantAttributes ?? item.attributes);
                const imageUrl = resolveImageUrl(item.productImage) ?? resolveImageUrl(fallbackProductImages[item.productId]);
                return (
                <li key={item.variantId} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-md bg-muted overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.productName || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {item.productName ?? 'Product'}
                    </p>
                    {attrLines.length > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {attrLines.join(' · ')}
                      </p>
                    ) : item.variantName ? (
                      <p className="text-sm text-muted-foreground">{item.variantName}</p>
                    ) : null}
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatPrice(item.price, DEFAULT_CURRENCY)} × {item.quantity} = {formatPrice(rowTotal, DEFAULT_CURRENCY)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={localQty[item.variantId] ?? item.quantity}
                      onChange={(e) => {
                        const q = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setLocalQty((prev) => ({ ...prev, [item.variantId]: q }));
                      }}
                      onBlur={() => handleQtyBlur(item.variantId)}
                      className="w-16 rounded border border-input bg-card px-2 py-1 text-center text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-sm text-destructive transition-colors hover:opacity-80"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
              })}
            </ul>
            <button
              type="button"
              onClick={() => clearCart()}
              className="mt-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear cart
            </button>
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="rounded-lg border border-border bg-muted/40 p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Summary
              </h2>
              <p className="mt-2 text-muted-foreground">
                Subtotal: {formatPrice(subtotal, DEFAULT_CURRENCY)}
              </p>
              <Link
                href={cartId ? `/checkout?cartId=${cartId}` : '/cart'}
                className="mt-4 block w-full rounded-md bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
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

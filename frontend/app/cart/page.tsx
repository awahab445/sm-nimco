'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart.store';
import { DEFAULT_CURRENCY } from '@/lib/config';

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
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-zinc-600 dark:border-t-blue-400" aria-hidden />
          <p className="mt-4 text-gray-500 dark:text-zinc-400">Loading cart…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
        Your cart
      </h1>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {items.length === 0 && !isLoading ? (
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 py-16 text-center dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-gray-600 dark:text-zinc-400">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
              {items.map((item) => {
                const rowTotal = item.price * item.quantity;
                const attrLines = formatVariantAttributes(item.variantAttributes ?? item.attributes);
                return (
                <li key={item.variantId} className="flex flex-wrap items-center gap-4 py-4">
                  {item.productImage && (
                    <div className="flex-shrink-0 w-14 h-14 rounded-md bg-gray-100 dark:bg-zinc-700 overflow-hidden">
                      <img
                        src={item.productImage}
                        alt={item.productName || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-zinc-50">
                      {item.productName ?? 'Product'}
                    </p>
                    {attrLines.length > 0 ? (
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {attrLines.join(' · ')}
                      </p>
                    ) : item.variantName ? (
                      <p className="text-sm text-gray-500 dark:text-zinc-400">{item.variantName}</p>
                    ) : null}
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
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
                      className="w-16 rounded border border-gray-300 px-2 py-1 text-center dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
              className="mt-4 text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Clear cart
            </button>
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Summary
              </h2>
              <p className="mt-2 text-gray-600 dark:text-zinc-400">
                Subtotal: {formatPrice(subtotal, DEFAULT_CURRENCY)}
              </p>
              <Link
                href={cartId ? `/checkout?cartId=${cartId}` : '/cart'}
                className="mt-4 block w-full rounded-md bg-gray-900 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
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

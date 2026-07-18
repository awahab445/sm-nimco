'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import { storefrontUi } from '@/lib/storefront-ui';
import { useCartStore } from '@/lib/cart.store';
import { trackAddBundleToCart } from '@/lib/analytics/events';
import type { StorefrontBundleDeal } from '@/lib/deals/deals.server';

type Props = {
  deal: StorefrontBundleDeal;
};

export function DealPricingPanel({ deal }: Props) {
  const router = useRouter();
  const addBundleToCart = useCartStore((s) => s.addBundleToCart);
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onAdd = async () => {
    setLoading(true);
    setError(null);
    try {
      await addBundleToCart(deal.id, quantity);
      trackAddBundleToCart(deal, quantity);
      router.push('/cart');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add bundle to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${storefrontUi.card} sticky top-24 border border-border p-6 shadow-product-card`}>
      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">Bundle pricing</h2>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Compare at</span>
          <span className="line-through">{formatPrice(deal.compareAtTotal)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Bundle price</span>
          <span>{formatPrice(deal.dealPrice)}</span>
        </div>
        {deal.savingsAmount > 0 ? (
          <p className="text-emerald-600 dark:text-emerald-400">
            You save {formatPrice(deal.savingsAmount)}
            {deal.savingsPercent != null ? ` (${deal.savingsPercent}%)` : ''}
          </p>
        ) : null}
      </div>

      <label className={`${storefrontUi.label} mt-6 block`}>
        Quantity
        {mounted ? (
          <input
            type="number"
            min={1}
            max={99}
            className={storefrontUi.inputMt}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore
            data-form-type="other"
          />
        ) : (
          <div
            className={`${storefrontUi.inputMt} text-muted-foreground`}
            aria-hidden
          >
            1
          </div>
        )}
      </label>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      {mounted ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void onAdd()}
          className={storefrontUi.btnPrimaryLg}
        >
          {loading ? 'Adding…' : 'Add bundle to cart'}
        </button>
      ) : (
        <button type="button" disabled className={storefrontUi.btnPrimaryLg}>
          Add bundle to cart
        </button>
      )}
    </div>
  );
}

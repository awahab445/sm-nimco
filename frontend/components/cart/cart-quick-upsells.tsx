'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { productApi, type Product } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart.store';
import { getVariantForCart } from '@/lib/product-cart-variant';
import { formatPrice } from '@/lib/currency';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { notifyAddToCartError } from '@/lib/notify-add-to-cart';
import { showStorefrontToast } from '@/lib/storefront-toast';

const UPSELL_LIMIT = 2;
const PRICE_CAP = 800;

type Props = {
  cartProductIds: string[];
  currency: string;
};

/** 1–2 affordable add-ons for the cart drawer. */
export function CartQuickUpsells({ cartProductIds, currency }: Props) {
  const addToCart = useCartStore((s) => s.addToCart);
  const [upsells, setUpsells] = useState<Product[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const cartKey = useMemo(
    () => [...cartProductIds].filter(Boolean).sort().join(','),
    [cartProductIds],
  );

  useEffect(() => {
    let cancelled = false;
    productApi
      .listProducts({ page: 1, limit: 12 })
      .then((res) => {
        if (cancelled) return;
        const inCart = new Set(cartKey ? cartKey.split(',') : []);
        const picks = (res.data ?? [])
          .filter((p) => !inCart.has(p.id))
          .map((p) => {
            const variant = getVariantForCart(p);
            const price = variant?.price ?? Number(p.basePrice);
            return { product: p, price: Number.isFinite(price) ? price : Infinity };
          })
          .filter((x) => x.price > 0 && x.price <= PRICE_CAP && getVariantForCart(x.product))
          .sort((a, b) => a.price - b.price)
          .slice(0, UPSELL_LIMIT)
          .map((x) => x.product);
        setUpsells(picks);
      })
      .catch(() => {
        if (!cancelled) setUpsells([]);
      });
    return () => {
      cancelled = true;
    };
  }, [cartKey]);

  if (upsells.length === 0) return null;

  const handleAdd = async (product: Product) => {
    const variant = getVariantForCart(product);
    if (!variant || addingId) return;
    setAddingId(product.id);
    try {
      await addToCart(product.id, variant.id, 1);
      showStorefrontToast('Added to cart', 'success');
    } catch (err) {
      notifyAddToCartError(err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-purple-dark,#1e1035)]">
        Add something sweet
      </p>
      <ul className="mt-2.5 space-y-2.5">
        {upsells.map((product) => {
          const variant = getVariantForCart(product);
          const image = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
          const src = resolveImageUrl(image?.url);
          const price = variant?.price ?? Number(product.basePrice);
          return (
            <li
              key={product.id}
              className="flex items-center gap-2.5 rounded-sm border border-border/70 bg-muted/20 p-2"
            >
              <Link
                href={`/products/${product.slug}`}
                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-muted"
              >
                {src ? (
                  <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                    —
                  </span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${product.slug}`}
                  className="block truncate text-xs font-medium text-foreground hover:text-[var(--navbar-link-hover,var(--primary-hover))]"
                >
                  {product.name}
                </Link>
                <p className="text-xs font-semibold text-product-price">
                  {formatPrice(price, currency)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleAdd(product)}
                disabled={!variant || addingId === product.id}
                className="shrink-0 rounded-sm bg-[var(--brand-purple-dark,#1e1035)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--brand-gold-primary,#d4af37)] transition-colors hover:bg-[var(--brand-purple-deep,#2e1a47)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingId === product.id ? '…' : 'Add'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

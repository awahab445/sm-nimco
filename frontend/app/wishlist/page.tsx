'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlistStore } from '@/lib/wishlist.store';
import { useCartStore } from '@/lib/cart.store';
import { useAuthStore } from '@/lib/auth.store';
import type { Product } from '@/lib/api-client';
import { formatPrice } from '@/lib/currency';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { imageAlt } from '@/lib/seo';
import { StorefrontImage } from '@/components/ui/storefront-image';
import { getVariantForCart } from '@/lib/product-cart-variant';
import { notifyAddToCartError } from '@/lib/notify-add-to-cart';
import { showStorefrontToast } from '@/lib/storefront-toast';
import { storefrontUi } from '@/lib/storefront-ui';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';

function productsFromStore(
  isAuthenticated: boolean,
  items: ReturnType<typeof useWishlistStore.getState>['items'],
  guestProducts: Product[],
): Product[] {
  if (isAuthenticated) {
    return items.map((i) => i.product).filter(Boolean);
  }
  return guestProducts;
}

export default function WishlistPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const productIds = useWishlistStore((s) => s.productIds);
  const items = useWishlistStore((s) => s.items);
  const guestProducts = useWishlistStore((s) => s.guestProducts);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const isHydrated = useWishlistStore((s) => s.isHydrated);
  const hydrate = useWishlistStore((s) => s.hydrate);
  const loadGuestProducts = useWishlistStore((s) => s.loadGuestProducts);
  const remove = useWishlistStore((s) => s.remove);
  const addToCart = useCartStore((s) => s.addToCart);

  const [addingId, setAddingId] = useState<string | null>(null);
  const [movingAll, setMovingAll] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated && productIds.length > 0) {
      void loadGuestProducts();
    }
  }, [isHydrated, isAuthenticated, productIds, loadGuestProducts]);

  const products = productsFromStore(isAuthenticated, items, guestProducts);
  const empty = isHydrated && productIds.length === 0;
  const movableCount = products.filter((p) => Boolean(getVariantForCart(p))).length;

  const handleRemove = async (productId: string) => {
    try {
      await remove(productId);
      showStorefrontToast('Removed from wishlist', 'success');
    } catch {
      showStorefrontToast('Could not remove item', 'error');
    }
  };

  const handleAddToCart = async (product: Product) => {
    const variant = getVariantForCart(product);
    if (!variant) {
      showStorefrontToast('This product cannot be added to cart', 'error');
      return;
    }
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

  const handleMoveAllToCart = async () => {
    if (movableCount === 0 || movingAll) return;
    setMovingAll(true);
    let added = 0;
    let failed = 0;
    const movedIds: string[] = [];
    try {
      for (const product of products) {
        const variant = getVariantForCart(product);
        if (!variant) {
          failed += 1;
          continue;
        }
        try {
          await addToCart(product.id, variant.id, 1);
          added += 1;
          movedIds.push(product.id);
        } catch {
          failed += 1;
        }
      }
      for (const id of movedIds) {
        try {
          await remove(id);
        } catch {
          /* keep in wishlist if remove fails */
        }
      }
      if (added > 0) {
        showStorefrontToast(
          failed > 0
            ? `Moved ${added} to cart (${failed} skipped)`
            : `Moved ${added} ${added === 1 ? 'item' : 'items'} to cart`,
          'success',
        );
      } else {
        showStorefrontToast('Could not move items to cart', 'error');
      }
    } finally {
      setMovingAll(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 pb-[calc(5.5rem+var(--mobile-mini-cart-height,0px)+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-10 lg:px-8 lg:pb-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Wishlist
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {empty
              ? 'Save products you love and find them here later.'
              : `${productIds.length} ${productIds.length === 1 ? 'item' : 'items'}`}
          </p>
        </div>
        {!empty && movableCount > 0 ? (
          <button
            type="button"
            onClick={() => void handleMoveAllToCart()}
            disabled={movingAll || addingId !== null}
            className={`inline-flex w-full items-center justify-center gap-2 sm:w-auto ${storefrontUi.btnPrimary} bg-[var(--brand-purple-dark,#1e1035)] px-5 py-2.5 text-[var(--brand-gold-primary,#d4af37)] hover:bg-[var(--brand-purple-deep,#2e1a47)] disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <ShoppingBagIcon className="h-4 w-4" strokeWidth={1.4} />
            {movingAll ? 'Moving…' : 'Move all to cart'}
          </button>
        ) : null}
      </header>

      {!isHydrated || (isLoading && products.length === 0 && !empty) ? (
        <p className="text-sm text-muted-foreground">Loading wishlist…</p>
      ) : empty ? (
        <div className="border border-border/60 bg-muted/20 px-6 py-16 text-center">
          <p className="text-base text-foreground">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart on any product to save it here.
          </p>
          <Link
            href="/products"
            className={`mt-6 inline-flex ${storefrontUi.btnPrimary}`}
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {products.map((product) => {
            const image =
              product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
            const imageUrl = resolveImageUrl(image?.url);
            const variant = getVariantForCart(product);
            const canAdd = Boolean(variant);

            return (
              <li
                key={product.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="relative h-28 w-full shrink-0 overflow-hidden bg-neutral-50 sm:h-24 sm:w-24"
                >
                  {imageUrl ? (
                    <StorefrontImage
                      src={imageUrl}
                      alt={imageAlt(image, product.name)}
                      fill
                      sizes="96px"
                      className="object-contain object-center"
                      quality={70}
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </span>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-display text-base font-medium text-foreground transition-colors hover:text-[var(--navbar-link-hover,var(--primary-hover))]"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm font-medium text-product-price">
                    {formatPrice(product.basePrice)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => void handleAddToCart(product)}
                    disabled={!canAdd || addingId === product.id}
                    className={`inline-flex items-center gap-2 ${storefrontUi.btnPrimary} px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <ShoppingBagIcon className="h-4 w-4" strokeWidth={1.4} />
                    {addingId === product.id ? 'Adding…' : 'Add to cart'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRemove(product.id)}
                    className={storefrontUi.btnSecondary}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!isAuthenticated && productIds.length > 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className={storefrontUi.link}>
            Sign in
          </Link>{' '}
          to save your wishlist across devices.
        </p>
      ) : null}
    </div>
  );
}

'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckoutProvider, useCheckout } from '@/lib/checkout-context';
import { useAuthStore } from '@/lib/auth.store';
import { OnePageCheckout } from '@/components/checkout/one-page-checkout';
import { storefrontUi } from '@/lib/storefront-ui';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartId = searchParams.get('cartId');
  const { user, isAuthenticated } = useAuthStore();

  const { checkoutId, checkout, isLoading, error, startCheckout, refreshCheckout } = useCheckout();

  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeCheckout = async () => {
      if (!cartId) {
        router.replace('/cart');
        return;
      }

      try {
        if (!checkoutId) {
          await startCheckout(cartId, {
            ...(isAuthenticated && user?.id && { customerId: user.id }),
          });
        } else {
          await refreshCheckout();
        }
      } catch (err) {
        console.error('Failed to initialize checkout:', err);
      } finally {
        setInitializing(false);
      }
    };

    initializeCheckout();
  }, [cartId, checkoutId, isAuthenticated, user?.id, startCheckout, refreshCheckout, router]);

  if (initializing || (isLoading && !checkout)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block h-12 w-12 animate-spin rounded-full border-2 border-muted border-t-primary"
            aria-hidden
          />
          <p className="mt-4 text-muted-foreground">Loading checkout…</p>
        </div>
      </div>
    );
  }

  if (!checkout) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display mb-4 text-2xl font-semibold tracking-tight text-foreground">
            Unable to start checkout
          </h1>
          <p className="mb-4 text-muted-foreground">
            {error ||
              'Unable to load checkout session. Your cart may be empty, below the minimum order amount, or expired.'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className={`${storefrontUi.btnPrimary} px-6 py-2`}
          >
            Return to cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-border/60 pb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Checkout</h1>
          <p className="mt-1 text-muted-foreground">Complete your purchase in one step</p>
        </div>

        <div className={`${storefrontUi.card} p-6 md:p-8`}>
          <OnePageCheckout />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <Suspense fallback={<div className="min-h-screen bg-background py-8" />}>
        <CheckoutContent />
      </Suspense>
    </CheckoutProvider>
  );
}

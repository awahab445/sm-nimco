'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckoutProvider, useCheckout } from '@/lib/checkout-context';
import { useAuthStore } from '@/lib/auth.store';
import { OnePageCheckout } from '@/components/checkout/one-page-checkout';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartId = searchParams.get('cartId');
  const { user, isAuthenticated } = useAuthStore();

  const {
    checkoutId,
    checkout,
    isLoading,
    startCheckout,
    refreshCheckout,
  } = useCheckout();

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading checkout…</p>
        </div>
      </div>
    );
  }

  if (!checkout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-zinc-50">
            Checkout not found
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 mb-4">
            Unable to load checkout session. Your cart may be empty or expired.
          </p>
          <button
            onClick={() => router.push('/cart')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50">Checkout</h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-1">
            Complete your purchase in one step
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6 md:p-8">
          <OnePageCheckout />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}

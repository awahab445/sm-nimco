'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart.store';
import { runWhenIdle } from '@/lib/analytics/gtag';

/**
 * Hydrates cart after first paint / idle so cart refresh does not contend
 * with LCP on mobile.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const getCartId = useCartStore((s) => s.getCartId);
  const refreshCart = useCartStore((s) => s.refreshCart);

  useEffect(() => {
    const cartId = getCartId();
    if (!cartId) return;
    runWhenIdle(() => {
      void refreshCart();
    }, 2500);
  }, [getCartId, refreshCart]);

  return <>{children}</>;
}

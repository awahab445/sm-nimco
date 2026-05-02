'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart.store';

/**
 * Hydrates cart from localStorage on mount (cartId + fetch cart).
 * Wrap the app or layout so cart is ready for header count and cart page.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const getCartId = useCartStore((s) => s.getCartId);
  const refreshCart = useCartStore((s) => s.refreshCart);

  useEffect(() => {
    const cartId = getCartId();
    if (cartId) {
      refreshCart();
    }
  }, [getCartId, refreshCart]);

  return <>{children}</>;
}

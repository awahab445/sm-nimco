'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/auth.store';
import { useWishlistStore } from '@/lib/wishlist.store';
import { runWhenIdle } from '@/lib/analytics/gtag';

/**
 * Hydrates wishlist (guest localStorage or server) and merges guest IDs after login.
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const hydrate = useWishlistStore((s) => s.hydrate);
  const syncAfterAuth = useWishlistStore((s) => s.syncAfterAuth);
  const resetToGuest = useWishlistStore((s) => s.resetToGuest);
  const wasAuthenticated = useRef<boolean | null>(null);

  useEffect(() => {
    runWhenIdle(() => {
      void hydrate();
    }, 2600);
  }, [hydrate]);

  useEffect(() => {
    if (isAuthLoading) return;

    const prev = wasAuthenticated.current;
    wasAuthenticated.current = isAuthenticated;

    if (prev === null) {
      // First settled auth state: if already logged in, sync (merge any guest IDs).
      if (isAuthenticated) {
        void syncAfterAuth();
      }
      return;
    }

    if (!prev && isAuthenticated) {
      void syncAfterAuth();
    } else if (prev && !isAuthenticated) {
      resetToGuest();
    }
  }, [isAuthenticated, isAuthLoading, syncAfterAuth, resetToGuest]);

  return <>{children}</>;
}

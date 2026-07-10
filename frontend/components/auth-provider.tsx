'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth.store';
import { runWhenIdle } from '@/lib/analytics/gtag';

/**
 * Auth Provider — defers session check until the browser is idle so it
 * does not compete with LCP / hydration on mobile.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    runWhenIdle(() => {
      void checkAuth();
    }, 2500);
  }, [checkAuth]);

  return <>{children}</>;
}

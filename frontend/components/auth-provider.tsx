'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth.store';

/**
 * Auth Provider Component
 * Initializes authentication state on app load
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}


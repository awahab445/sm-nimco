'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { StoreThemeCode } from '@/lib/theme/types';

const StoreThemeContext = createContext<StoreThemeCode>('default');

export function StoreThemeProvider({
  theme,
  children,
}: {
  theme: StoreThemeCode;
  children: ReactNode;
}) {
  return (
    <StoreThemeContext.Provider value={theme}>{children}</StoreThemeContext.Provider>
  );
}

/** Active storefront preset from layout (matches `html[data-store-theme]`). */
export function useStoreThemePreset(): StoreThemeCode {
  return useContext(StoreThemeContext);
}

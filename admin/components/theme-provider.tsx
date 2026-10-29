'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * Thin client wrapper around next-themes.
 * Theme init uses next-themes' built-in FOUC script (no custom <script> in layout).
 * `scriptProps.type = application/json` avoids Next.js 16 / React 19's
 * "Encountered a script tag while rendering React component" warning.
 */
export function ThemeProvider({
  children,
  scriptProps,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      scriptProps={{
        type: 'application/json',
        ...scriptProps,
      }}
    >
      {children}
    </NextThemesProvider>
  );
}

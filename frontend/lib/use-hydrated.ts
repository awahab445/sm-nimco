'use client';

import { useEffect, useState } from 'react';

/** True after the client has mounted. Use to skip SSR for nodes extensions often mutate before hydration. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => undefined;

/** True after the client has mounted. Safe for portals / extension-mutated DOM. */
export function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

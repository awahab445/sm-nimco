'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/lib/use-permissions';
import { getRouteRequirement } from '@/lib/route-permissions';
import { NoAccessPanel } from '@/components/permission-gate';

/**
 * Wraps every page in the admin `(app)` group and enforces route-level RBAC
 * by consulting `getRouteRequirement(pathname)`.
 *
 * Behavior:
 *   - Route unknown to the map → render children (treat as unrestricted).
 *   - Route requires keys + auth not yet ready → render a small loading state
 *     instead of the children, so we never flash protected UI.
 *   - Route requires keys + user has at least one → render children.
 *   - Route requires keys + user has none → render `<NoAccessPanel>` instead.
 *
 * This is **UX only**. Every protected API endpoint also enforces
 * `@CheckPermission` server-side; hand-crafted requests still return 403.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const { ready, canAny } = usePermissions();

  const requirement = getRouteRequirement(pathname);

  // No rule at all OR explicit open-for-all-admins rule.
  if (requirement === null || requirement.length === 0) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        Checking access…
      </div>
    );
  }

  if (!canAny(requirement)) {
    return <NoAccessPanel requiredKeys={requirement} />;
  }

  return <>{children}</>;
}

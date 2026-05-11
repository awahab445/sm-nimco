'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePermissions } from '@/lib/use-permissions';

type CommonProps = {
  /** Rendered when the user has access. */
  children: ReactNode;
  /** Rendered when the user does not have access. Defaults to `null` (hide). */
  fallback?: ReactNode;
  /** Render `fallback` while the auth check is still in flight. Defaults to `true`. */
  waitForReady?: boolean;
};

type ModeAll = CommonProps & {
  /** All listed keys must be granted (AND). */
  allOf: ReadonlyArray<string>;
  anyOf?: never;
};

type ModeAny = CommonProps & {
  /** At least one of the listed keys must be granted (OR). */
  anyOf: ReadonlyArray<string>;
  allOf?: never;
};

/**
 * Render `children` only when the current user has the required permission(s).
 *
 * Examples:
 *   <PermissionGate allOf={['admin.users.create']}>
 *     <button>New admin user</button>
 *   </PermissionGate>
 *
 *   <PermissionGate anyOf={['products.update', 'products.delete']}>
 *     <ActionsMenu />
 *   </PermissionGate>
 */
export function PermissionGate(props: ModeAll | ModeAny) {
  const { children, fallback = null, waitForReady = true } = props;
  const { ready, canAll, canAny } = usePermissions();

  if (waitForReady && !ready) return <>{fallback}</>;

  const granted =
    'allOf' in props && props.allOf
      ? canAll(props.allOf)
      : 'anyOf' in props && props.anyOf
        ? canAny(props.anyOf)
        : false;

  return <>{granted ? children : fallback}</>;
}

/**
 * Full-page "no access" panel for use as a fallback when gating an entire route.
 * Stays consistent with the rest of the admin UI.
 */
export function NoAccessPanel({
  message,
  requiredKeys,
}: {
  message?: string;
  requiredKeys?: ReadonlyArray<string>;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
      <h2 className="text-base font-semibold">You do not have access to this page.</h2>
      <p className="mt-2">
        {message ??
          'Your assigned roles do not include the required permission. Ask a super-admin to grant it or assign you a role that has it.'}
      </p>
      {requiredKeys && requiredKeys.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide">Required permission(s)</p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {requiredKeys.map((k) => (
              <li
                key={k}
                className="rounded-md bg-amber-100 px-2 py-0.5 font-mono text-[11px] text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
              >
                {k}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-4">
        <Link href="/" className="font-medium underline">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}

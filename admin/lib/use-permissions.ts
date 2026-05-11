'use client';

import { useMemo } from 'react';
import { useAuthStore } from './auth.store';
import {
  buildPermissionKey,
  hasAll as hasAllKeys,
  hasAny as hasAnyKeys,
  hasPermission,
  SUPER_ADMIN_ROLE_SLUG,
  type RbacAction,
  type RbacEntity,
} from './permissions';

/**
 * React hook returning permission helpers backed by `useAuthStore`.
 *
 * `can(entity, action)` matches the backend `@CheckPermission` shape exactly,
 * so a control is shown to the user only when the API would also allow the call.
 *
 * Note: the backend already enforces every check — these helpers exist purely
 * to keep the UI honest (hide buttons, gate routes, skip useless fetches).
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  return useMemo(() => {
    const keys = user?.permissions ?? [];
    const roles = user?.roles ?? [];

    const isSuperAdmin = roles.some((r) => r.slug === SUPER_ADMIN_ROLE_SLUG);

    const can = (entity: RbacEntity | string, action: RbacAction | string): boolean => {
      if (isSuperAdmin) return true;
      return hasPermission(keys, buildPermissionKey(entity, action));
    };

    const canKey = (key: string): boolean => {
      if (isSuperAdmin) return true;
      return hasPermission(keys, key);
    };

    const canAny = (permissionKeys: ReadonlyArray<string>): boolean => {
      if (isSuperAdmin) return true;
      return hasAnyKeys(keys, permissionKeys);
    };

    const canAll = (permissionKeys: ReadonlyArray<string>): boolean => {
      if (isSuperAdmin) return true;
      return hasAllKeys(keys, permissionKeys);
    };

    return {
      /** True only after auth check has finished. Avoid flashing protected UI before then. */
      ready: !isAuthLoading && Boolean(user),
      isSuperAdmin,
      can,
      canKey,
      canAny,
      canAll,
      /** Raw effective keys (for debugging or advanced cases). */
      permissionKeys: keys,
    };
  }, [user, isAuthLoading]);
}

/**
 * Frontend mirror of the backend permission key shape. Effective permission
 * keys are fetched from `GET /admin/auth/me` and stored on `useAuthStore`.
 *
 * Convention: `${entity}.${action}`, matching `@CheckPermission` on the API.
 * Keep this list in sync with `RbacEntity` in the backend decorator.
 */

export type RbacEntity =
  | 'products'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'cms'
  | 'reports'
  | 'settings'
  | 'shipping'
  | 'tax'
  | 'payments'
  | 'promotions'
  | 'subscriptions'
  | 'admin.users'
  | 'admin.roles';

export type RbacAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export const buildPermissionKey = (entity: RbacEntity | string, action: RbacAction | string) =>
  `${entity}.${action}` as const;

/** Special key the API hands back for fully-privileged users. */
const FULL_ACCESS_KEY = 'admin.access.full';

/**
 * If `key` is `<entity>.<action>` and the action isn't already `manage`, return
 * the corresponding `<entity>.manage` wildcard key. Used to implement the
 * "manage implies CRUD" convention so a user holding `products.manage` is
 * treated as having `products.read`, `products.update`, etc. — same as how
 * `customers.manage` already grants customers.read on existing routes.
 */
function manageWildcardFor(key: string): string | null {
  const lastDot = key.lastIndexOf('.');
  if (lastDot <= 0) return null;
  const action = key.slice(lastDot + 1);
  if (!action || action === 'manage') return null;
  return `${key.slice(0, lastDot)}.manage`;
}

export function hasPermission(
  effectiveKeys: ReadonlyArray<string> | null | undefined,
  key: string,
): boolean {
  if (!effectiveKeys || effectiveKeys.length === 0) return false;
  if (effectiveKeys.includes(key)) return true;
  if (effectiveKeys.includes(FULL_ACCESS_KEY) || effectiveKeys.includes('*')) {
    return true;
  }
  const wildcard = manageWildcardFor(key);
  if (wildcard !== null && effectiveKeys.includes(wildcard)) return true;
  return false;
}

export function hasAny(
  effectiveKeys: ReadonlyArray<string> | null | undefined,
  keys: ReadonlyArray<string>,
): boolean {
  return keys.some((k) => hasPermission(effectiveKeys, k));
}

export function hasAll(
  effectiveKeys: ReadonlyArray<string> | null | undefined,
  keys: ReadonlyArray<string>,
): boolean {
  return keys.every((k) => hasPermission(effectiveKeys, k));
}

export const SUPER_ADMIN_ROLE_SLUG = 'super-admin';

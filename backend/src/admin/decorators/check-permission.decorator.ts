import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../guards/admin-permissions.guard';
import { RequirePermissions } from './require-permissions.decorator';

/**
 * Entities that participate in RBAC checks. Kept as a string union so the
 * decorator is autocomplete-friendly while still allowing controller code to
 * pass any seeded resource code (extend the union as new resources are added).
 *
 * Naming rules:
 *   - `customers`   — storefront users (buyers).
 *   - `admin.users` — staff/back-office users (RBAC subjects).
 *   - Do NOT use a bare `users` here; it's ambiguous between the two.
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

/** Standard CRUD plus `manage` (a coarser bundle already used by existing seed keys). */
export type RbacAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

/** Build the canonical permission key checked against `admin_permissions.key`. */
export const buildPermissionKey = (
  entity: RbacEntity | string,
  action: RbacAction | string,
) => `${entity}.${action}` as const;

/**
 * Controller-level middleware: requires an authenticated admin whose roles grant
 * `${entity}.${action}`. Returns 403 Forbidden when the permission is missing
 * (or 401 if no admin session). Super-admin and the `admin.access.full` wildcard
 * are honored by `AdminPermissionsGuard` / `AdminRbacService`.
 *
 * Usage:
 *   @Patch(':id')
 *   @CheckPermission('products', 'update')
 *   updateProduct(@Param('id') id: string) { ... }
 */
export function CheckPermission(entity: RbacEntity, action: RbacAction) {
  return applyDecorators(
    UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard),
    RequirePermissions(buildPermissionKey(entity, action)),
  );
}

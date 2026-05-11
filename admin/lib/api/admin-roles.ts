import { fetchApi } from '../api-client';

export type AdminPermission = {
  /** Optional — present from the catalog endpoint, absent when nested under a role. */
  id?: string;
  key: string;
  description: string | null;
  /** Number of roles currently granting this permission. Catalog only. */
  roleCount?: number;
};

export type AdminRole = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: { permission: AdminPermission }[];
};

export async function fetchAdminRoles(): Promise<AdminRole[]> {
  return fetchApi<AdminRole[]>('/admin/roles');
}

export async function fetchAdminRole(id: string): Promise<AdminRole> {
  return fetchApi<AdminRole>(`/admin/roles/${id}`);
}

export async function fetchAdminPermissionCatalog(): Promise<AdminPermission[]> {
  return fetchApi<AdminPermission[]>('/admin/roles/permissions/catalog');
}

/** New permission key minted alongside a role create / update. */
export type NewPermissionInput = {
  key: string;
  description?: string;
};

export type CreateAdminRoleBody = {
  slug: string;
  name: string;
  description?: string;
  permissionKeys?: string[];
  /** Fresh permission keys to create in `admin_permissions` before granting. */
  newPermissions?: NewPermissionInput[];
};

export async function createAdminRole(body: CreateAdminRoleBody): Promise<AdminRole> {
  return fetchApi<AdminRole>('/admin/roles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateAdminRoleBody = {
  name?: string;
  description?: string;
  permissionKeys?: string[];
  /** Fresh permission keys to create in `admin_permissions` before granting. */
  newPermissions?: NewPermissionInput[];
};

export async function updateAdminRole(
  id: string,
  body: UpdateAdminRoleBody,
): Promise<AdminRole> {
  return fetchApi<AdminRole>(`/admin/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteAdminRole(id: string): Promise<{ id: string; deleted: boolean }> {
  return fetchApi<{ id: string; deleted: boolean }>(`/admin/roles/${id}`, {
    method: 'DELETE',
  });
}

export type DeleteAdminPermissionResult = {
  key: string;
  deleted: boolean;
  /** How many role grants were cascade-removed when this permission was deleted. */
  roleLinksRemoved: number;
};

/**
 * Permanently delete a permission row from the catalog. Cascades remove this
 * key from every role that currently grants it. Restricted to super-admins
 * on the backend.
 */
export async function deleteAdminPermission(
  key: string,
): Promise<DeleteAdminPermissionResult> {
  return fetchApi<DeleteAdminPermissionResult>(
    `/admin/roles/permissions/${encodeURIComponent(key)}`,
    { method: 'DELETE' },
  );
}

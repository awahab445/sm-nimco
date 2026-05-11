'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  deleteAdminRole,
  fetchAdminRoles,
  type AdminRole,
} from '@/lib/api/admin-roles';
import { formatApiError } from '@/lib/api/error-message';
import { usePermissions } from '@/lib/use-permissions';
import { NoAccessPanel } from '@/components/permission-gate';

export function StaffRolesList() {
  const { ready, can, isSuperAdmin } = usePermissions();
  const canRead = can('admin.roles', 'read');
  const canManage = can('admin.roles', 'manage');
  const canCreateUsers = can('admin.users', 'create');

  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const rs = await fetchAdminRoles();
      setRoles(rs);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!canRead) {
      setLoading(false);
      return;
    }
    void load();
  }, [ready, canRead, load]);

  if (ready && !canRead) {
    return <NoAccessPanel requiredKeys={['admin.roles.read']} />;
  }

  async function handleDelete(role: AdminRole) {
    // Super-admins have full control — backend allows even system-role deletion
    // when the actor is super-admin. We mirror that here with a stronger prompt.
    const isSuper = role.slug === 'super-admin';

    let msg: string;
    if (isSuper) {
      msg =
        `DESTRUCTIVE: delete the SUPER-ADMIN role "${role.name}"?\n\n` +
        `Every user currently holding super-admin will lose privileged access ` +
        `on their next request — INCLUDING YOU.\n\n` +
        `You can run "npx prisma db seed" later to recreate the role, but you ` +
        `will need direct DB access to re-link your own user to it.\n\n` +
        `Type OK only if you really mean it.`;
    } else if (role.isSystem) {
      msg =
        `Delete system role "${role.name}" (${role.slug})?\n\n` +
        `This is permanent. Any users currently holding this role will lose ` +
        `whatever permissions it granted.\n\n` +
        `You can re-run "npx prisma db seed" to recreate the role with its ` +
        `default permission set, but you will need to re-assign it to users.`;
    } else {
      msg =
        `Delete role "${role.name}" (${role.slug})?\n\n` +
        `This is permanent. The role will be removed from any users who ` +
        `currently have it, and its permission set will be lost.`;
    }

    const ok = window.confirm(msg);
    if (!ok) return;
    setDeletingId(role.id);
    setError(null);
    try {
      await deleteAdminRole(role.id);
      await load();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setDeletingId(null);
    }
  }

  const sorted = roles.slice().sort((a, b) => {
    if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Roles &amp; permissions
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Read-only view of seeded admin roles and the permission keys each grants. System roles
            are managed via the seed script on the backend. Requires{' '}
            <span className="font-mono text-xs">admin.roles.read</span>.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {canCreateUsers ? (
            <Link
              href="/staff/users/new"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium dark:border-zinc-600"
            >
              Create admin user
            </Link>
          ) : null}
          {canManage ? (
            <Link
              href="/staff/roles/new"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              New role
            </Link>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
          Loading…
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
          No roles defined. Run <span className="font-mono text-xs">prisma db seed</span> to create
          the system roles.
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {sorted.map((r) => {
            const isDeleting = deletingId === r.id;
            return (
              <article
                key={r.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <header className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {r.name}
                    </h2>
                    <p className="mt-0.5 font-mono text-xs text-zinc-500">{r.slug}</p>
                    {r.description ? (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {r.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {r.isSystem ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                        system
                      </span>
                    ) : null}
                    {canManage ? (
                      <Link
                        href={`/staff/roles/${r.id}`}
                        className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
                      >
                        Edit
                      </Link>
                    ) : null}
                    {isSuperAdmin ? (
                      <button
                        type="button"
                        onClick={() => void handleDelete(r)}
                        disabled={isDeleting}
                        title={
                          r.isSystem
                            ? 'Delete system role (super-admin override). The seed can recreate it later.'
                            : 'Delete role'
                        }
                        className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40"
                      >
                        {isDeleting ? 'Deleting…' : 'Delete'}
                      </button>
                    ) : null}
                  </div>
                </header>

                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Permissions ({r.permissions.length})
                  </p>
                  {r.permissions.length === 0 ? (
                    <p className="mt-1 text-sm text-zinc-500">No permissions granted.</p>
                  ) : (
                    <ul className="mt-2 flex flex-wrap gap-1">
                      {r.permissions
                        .slice()
                        .sort((a, b) => a.permission.key.localeCompare(b.permission.key))
                        .map(({ permission: p }) => (
                          <li
                            key={p.key}
                            title={p.description ?? p.key}
                            className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                          >
                            {p.key}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

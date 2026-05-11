'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchStaffUsers, type StaffUser } from '@/lib/api/admin-users';
import { formatApiError } from '@/lib/api/error-message';
import { useAuthStore } from '@/lib/auth.store';
import { usePermissions } from '@/lib/use-permissions';
import { NoAccessPanel } from '@/components/permission-gate';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function StaffUsersList() {
  const me = useAuthStore((s) => s.user);
  const { ready, can } = usePermissions();
  const canRead = can('admin.users', 'read');
  const canCreate = can('admin.users', 'create');
  const canUpdate = can('admin.users', 'update');

  const [rows, setRows] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchStaffUsers();
      setRows(list);
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
  }, [load, ready, canRead]);

  if (ready && !canRead) {
    return <NoAccessPanel requiredKeys={['admin.users.read']} />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Admin users
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Staff accounts with back-office access. Roles control which routes they can call.
            Requires <span className="font-mono text-xs">admin.users.read</span>.
          </p>
        </div>
        {canCreate ? (
          <Link
            href="/staff/users/new"
            className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            New admin user
          </Link>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No admin users yet.</div>
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">User</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Roles</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Last login</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((u) => {
                const isMe = me?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                        {isMe ? (
                          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                            you
                          </span>
                        ) : null}
                      </div>
                      <div className="font-mono text-xs text-zinc-500">{u.id.slice(0, 8)}…</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 ? (
                          <span className="text-xs text-zinc-500">No roles</span>
                        ) : (
                          u.roles.map((r) => (
                            <span
                              key={r.id}
                              className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                              title={r.slug}
                            >
                              {r.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {formatDate(u.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canUpdate ? (
                        <Link
                          href={`/staff/users/${u.id}`}
                          className="font-medium text-zinc-900 underline dark:text-zinc-100"
                        >
                          Edit
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

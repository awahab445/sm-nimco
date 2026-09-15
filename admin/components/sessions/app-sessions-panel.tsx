'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchAppSessions,
  setAppSessionBlocked,
  type AppSessionRow,
} from '@/lib/api/app-sessions';
import { formatApiError } from '@/lib/api/error-message';
import { usePermissions } from '@/lib/use-permissions';
import { NoAccessPanel } from '@/components/permission-gate';

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 45) return 'just now';
  if (diffSec < 90) return '1 min ago';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  if (diffSec < 5400) return '1 hour ago';
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 172800) return '1 day ago';
  return `${Math.floor(diffSec / 86400)} days ago`;
}

function StatusBadge({ status }: { status: AppSessionRow['status'] }) {
  const active = status === 'active';
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        active
          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
          : 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200'
      }`}
    >
      {active ? 'Active' : 'Blocked'}
    </span>
  );
}

export function AppSessionsPanel() {
  const { ready, can } = usePermissions();
  const canRead = can('admin.users', 'read');
  const canUpdate = can('admin.users', 'update');

  const [rows, setRows] = useState<AppSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setRows(await fetchAppSessions());
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
    const id = window.setInterval(() => {
      void load();
    }, 30000);
    return () => window.clearInterval(id);
  }, [load, ready, canRead]);

  async function toggleBlock(row: AppSessionRow) {
    if (!canUpdate) return;
    const next = !row.isBlocked;
    const label = next ? 'block' : 'unblock';
    if (!window.confirm(`${label === 'block' ? 'Block' : 'Unblock'} ${row.name}?`)) {
      return;
    }
    setBusyId(row.userId);
    setError(null);
    try {
      const updated = await setAppSessionBlocked(row.userId, next);
      setRows((prev) =>
        prev.map((r) => (r.userId === updated.userId ? updated : r)),
      );
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setBusyId(null);
    }
  }

  if (ready && !canRead) {
    return <NoAccessPanel requiredKeys={['admin.users.read']} />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Connected Users & Device Security
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Monitor store-operator app sessions. Blocking revokes mobile API access
            immediately (JWT rejected with USER_BLOCKED).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className={adminUi.btnSecondary}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                User
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Role
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                IP
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Device
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Last seen
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Status
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading && rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Loading sessions…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No connected store-operator sessions yet. Sessions appear after the
                  mobile app sends a heartbeat ping.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.userId}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {row.name}
                    </div>
                    <div className="text-xs text-zinc-500">{row.email}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {row.role ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {row.ipAddress ?? '—'}
                  </td>
                  <td
                    className="max-w-[14rem] truncate px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400"
                    title={row.deviceInfo ?? undefined}
                  >
                    {row.deviceInfo ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {formatRelative(row.lastActiveAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3">
                    {canUpdate ? (
                      <button
                        type="button"
                        disabled={busyId === row.userId}
                        onClick={() => void toggleBlock(row)}
                        className={
                          row.isBlocked ? adminUi.btnSecondary : adminUi.btnDestructive
                        }
                      >
                        {busyId === row.userId
                          ? '…'
                          : row.isBlocked
                            ? 'Unblock'
                            : 'Block / Revoke'}
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

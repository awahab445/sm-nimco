'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  deleteMailMailbox,
  fetchMailMailboxes,
  MAILBOX_PURPOSES,
  type MailMailbox,
} from '@/lib/api/mail-mailboxes';
import { formatApiError } from '@/lib/api/error-message';

const PURPOSE_LABELS: Record<string, string> = {
  ORDERS: 'Order confirmations & cancellations',
  WELCOME: 'Welcome emails',
  AUTH: 'Verification, password reset, account links',
  MARKETING: 'Marketing campaigns',
  SUPPORT: 'Support / helpdesk',
  GENERAL: 'General fallback',
};

export function MailMailboxesHub() {
  const [rows, setRows] = useState<MailMailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchMailMailboxes(includeInactive);
      setRows(list);
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(row: MailMailbox) {
    if (
      !window.confirm(
        `Delete mailbox "${row.name}" (${row.code})? Outbound email for purpose ${row.purpose} will fall back to env SMTP or another mailbox.`,
      )
    ) {
      return;
    }
    setDeletingId(row.id);
    try {
      await deleteMailMailbox(row.id);
      await load();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Mail servers
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Dedicated SMTP mailboxes for M. Essa Chemicals. Passwords are encrypted at rest and
            never returned from the API.
          </p>
        </div>
        <Link
          href="/mail/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New mailbox
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Routing by purpose</p>
        <ul className="mt-2 grid gap-1 text-xs text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
          {MAILBOX_PURPOSES.map((p) => (
            <li key={p}>
              <span className="font-mono text-zinc-800 dark:text-zinc-300">{p}</span>
              {' — '}
              {PURPOSE_LABELS[p]}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          Include inactive mailboxes
        </label>
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
          <div className="p-8 text-center text-sm text-zinc-500">
            No mailboxes yet.{' '}
            <Link href="/mail/new" className="font-medium underline">
              Create one
            </Link>
            .
          </div>
        ) : (
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Purpose</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">SMTP</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">From</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  {' '}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{row.name}</div>
                    <div className="font-mono text-xs text-zinc-500">{row.code}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs">{row.purpose}</span>
                    {row.isDefault ? (
                      <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        default
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {row.smtpHost}:{row.smtpPort}
                    <br />
                    <span className="font-mono">{row.smtpUser}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {row.fromName}
                    <br />
                    {row.fromAddress}
                  </td>
                  <td className="px-4 py-3">
                    {row.isActive ? (
                      <span className="text-emerald-700 dark:text-emerald-400">Active</span>
                    ) : (
                      <span className="text-zinc-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/mail/${row.id}`}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium dark:border-zinc-600"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        onClick={() => void onDelete(row)}
                        className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 disabled:opacity-50 dark:border-red-800 dark:text-red-300"
                      >
                        {deletingId === row.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

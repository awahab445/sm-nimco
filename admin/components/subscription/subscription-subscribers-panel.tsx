'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchSubscriptionSubscribers,
  type SubscriptionSubscriberRow,
} from '@/lib/api/subscription';
import { formatApiError } from '@/lib/api/error-message';

export function SubscriptionSubscribersPanel() {
  const [rows, setRows] = useState<SubscriptionSubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubscriptionSubscribers();
      setRows(data);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Subscription</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Email addresses from the storefront subscription form (marketing opt-in).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading subscribers…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No subscribers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Source
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {r.email}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {r.source ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

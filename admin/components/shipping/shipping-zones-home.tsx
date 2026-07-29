'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchShippingZones, type ShippingZone } from '@/lib/api/shipping';
import { formatApiError } from '@/lib/api/error-message';

export function ShippingZonesHome() {
  const [rows, setRows] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchShippingZones({ includeInactive });
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

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Shipping
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Zones, methods per zone, customer-group pricing, and order assignment (
            <Link href="/shipping/orders" className="font-medium underline">
              order tools
            </Link>
            ).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/shipping/rates"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium dark:border-zinc-600"
          >
            Shipping rates (CSV)
          </Link>
          <Link
            href="/shipping/zones/new"
            className={adminUi.btnPrimary}
          >
            New zone
          </Link>
          <Link
            href="/shipping/orders"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium dark:border-zinc-600"
          >
            Order shipping
          </Link>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          Include inactive zones
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
          <div className="p-8 text-center text-sm text-zinc-500">No zones yet.</div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Priority</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Coverage</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Active</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  {' '}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((z) => (
                <tr key={z.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{z.name}</div>
                    {z.description ? (
                      <div className="text-xs text-zinc-500">{z.description}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                    {z.priority}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {z.coverage?.countries?.length
                      ? `${z.coverage.countries.length} countries`
                      : 'default / open'}
                  </td>
                  <td className="px-4 py-3">
                    {z.isActive ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                        Yes
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-300">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/shipping/zones/${z.id}`}
                      className="font-medium text-zinc-900 underline dark:text-zinc-100"
                    >
                      Manage
                    </Link>
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

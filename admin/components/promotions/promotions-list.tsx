'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchPromotions, type Promotion, type PromotionLifecycleStatus } from '@/lib/api/promotions';
import { formatApiError } from '@/lib/api/error-message';

function statusPill(status: PromotionLifecycleStatus) {
  const map: Record<PromotionLifecycleStatus, string> = {
    draft: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
    active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
    expired: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
    disabled: 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

export function PromotionsList() {
  const [rows, setRows] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PromotionLifecycleStatus | ''>('');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchPromotions({ allStatuses: true });
      setRows(list);
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!statusFilter) return rows;
    return rows.filter((p) => p.status === statusFilter);
  }, [rows, statusFilter]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Promotions
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Coupons and cart rules. List uses <span className="font-mono">allStatuses=true</span> so
            drafts appear; storefront still receives active-only when the flag is omitted.
          </p>
        </div>
        <Link
          href="/promotions/new"
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New promotion
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-48">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PromotionLifecycleStatus | '')}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No promotions match.</div>
        ) : (
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Code</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Type</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Discount</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Usage</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  {' '}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    {p.code ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.type}</td>
                  <td className="px-4 py-3">{statusPill(p.status)}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {p.discountValue != null
                      ? p.discountType === 'percentage'
                        ? `${p.discountValue}%`
                        : String(p.discountValue)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                    {p.currentUsage}
                    {p.usageLimit != null ? ` / ${p.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/promotions/${p.id}`}
                      className="font-medium text-zinc-900 underline dark:text-zinc-100"
                    >
                      Open
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

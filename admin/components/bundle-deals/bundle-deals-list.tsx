'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  deleteBundleDeal,
  fetchBundleDeals,
  type BundleDeal,
  type BundleDealStatus,
} from '@/lib/api/bundle-deals';
import { formatApiError } from '@/lib/api/error-message';
import { PermissionGate } from '@/components/permission-gate';

function formatRs(amount: number) {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function statusPill(status: BundleDealStatus) {
  const map: Record<BundleDealStatus, string> = {
    draft: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
    active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
    disabled: 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

export function BundleDealsList() {
  const [rows, setRows] = useState<BundleDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BundleDealStatus | ''>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchBundleDeals({ limit: 100 });
      setRows(res.data);
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

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const onDelete = useCallback(async (deal: BundleDeal) => {
    if (
      !window.confirm(
        `Delete bundle deal "${deal.title}"?\n\nThis will remove it from the storefront.`,
      )
    ) {
      return;
    }
    setDeletingId(deal.id);
    try {
      await deleteBundleDeal(deal.id);
      setRows((prev) => prev.filter((r) => r.id !== deal.id));
      setToast({ kind: 'success', message: 'Bundle deal deleted.' });
    } catch (e) {
      setToast({ kind: 'error', message: formatApiError(e) });
    } finally {
      setDeletingId(null);
    }
  }, []);

  const filtered = useMemo(() => {
    if (!statusFilter) return rows;
    return rows.filter((d) => d.status === statusFilter);
  }, [rows, statusFilter]);

  return (
    <div className="mx-auto max-w-6xl">
      {toast ? (
        <div
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-100'
              : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/90 dark:text-red-100'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Bundle deals</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Compose product bundles with custom deal pricing for the storefront.
          </p>
        </div>
        <PermissionGate anyOf={['deals.manage']}>
          <Link href="/bundle-deals/new" className={adminUi.btnPrimary}>
            New bundle deal
          </Link>
        </PermissionGate>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-zinc-600 dark:text-zinc-400">
          Status
          <select
            className="ml-2 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BundleDealStatus | '')}
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>
        <button type="button" onClick={() => void load()} className={adminUi.btnSecondary}>
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading bundle deals…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">No bundle deals yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">Title</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">Items</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">Deal price</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">Savings</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-950">
              {filtered.map((deal) => (
                <tr key={deal.id}>
                  <td className="px-4 py-3">
                    <Link href={`/bundle-deals/${deal.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                      {deal.title}
                    </Link>
                    {deal.isFeatured ? (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                        Featured
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{statusPill(deal.status)}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{deal.itemCount ?? '—'}</td>
                  <td className="px-4 py-3">{formatRs(deal.dealPrice)}</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400">
                    {formatRs(deal.savingsAmount)}
                    {deal.savingsPercent != null ? ` (${deal.savingsPercent}%)` : ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/bundle-deals/${deal.id}`} className="mr-3 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                      Edit
                    </Link>
                    <PermissionGate anyOf={['deals.manage']}>
                      <button
                        type="button"
                        disabled={deletingId === deal.id}
                        onClick={() => void onDelete(deal)}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400"
                      >
                        {deletingId === deal.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </PermissionGate>
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

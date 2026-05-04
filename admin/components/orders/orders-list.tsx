'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  fetchAdminOrders,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/api/orders';
import { formatApiError } from '@/lib/api/error-message';

function money(amount: string | number, currency: string) {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(n)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

function statusPill(label: string, tone: 'neutral' | 'success' | 'warning' | 'danger') {
  const tones = {
    neutral: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
    success: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
    danger: 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200',
  } as const;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {label}
    </span>
  );
}

function orderStatusTone(s: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (s === 'completed') return 'success';
  if (s === 'cancelled') return 'danger';
  if (s === 'processing') return 'warning';
  return 'neutral';
}

function paymentTone(s: string | null | undefined): 'neutral' | 'success' | 'warning' | 'danger' {
  if (s === 'paid') return 'success';
  if (s === 'failed') return 'danger';
  if (s === 'refunded') return 'warning';
  return 'neutral';
}

export function OrdersList() {
  const searchParams = useSearchParams();
  const customerIdFromUrl = searchParams.get('customerId')?.trim() || '';

  const [rows, setRows] = useState<Order[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'grandTotal'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [customerIdFromUrl, statusFilter, paymentFilter, sortBy, sortOrder]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchAdminOrders({
        ...(customerIdFromUrl ? { customerId: customerIdFromUrl } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(paymentFilter ? { paymentStatus: paymentFilter } : {}),
        page,
        limit: 20,
        sortBy,
        sortOrder,
      });
      setRows(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [customerIdFromUrl, statusFilter, paymentFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const clearCustomerFilterHref =
    statusFilter || paymentFilter
      ? `/orders?${new URLSearchParams({
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(paymentFilter ? { paymentStatus: paymentFilter } : {}),
        }).toString()}`
      : '/orders';

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Orders
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Operational list with status filters. Pagination is server-side via the API.
        </p>
      </div>

      {customerIdFromUrl ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900/50">
          <span className="text-zinc-700 dark:text-zinc-300">
            Filtered by customer{' '}
            <span className="font-mono text-xs text-zinc-500">{customerIdFromUrl}</span>
          </span>
          <Link
            href={clearCustomerFilterHref}
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Clear customer filter
          </Link>
          <Link
            href={`/customers/${customerIdFromUrl}`}
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Open customer
          </Link>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="w-full sm:w-44">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Order status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | '');
              setPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="w-full sm:w-44">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Payment status
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as PaymentStatus | '');
              setPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div className="w-full sm:w-44">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as typeof sortBy);
              setPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="createdAt">Created</option>
            <option value="updatedAt">Updated</option>
            <option value="grandTotal">Grand total</option>
          </select>
        </div>
        <div className="w-full sm:w-36">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Direction</label>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as 'asc' | 'desc');
              setPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
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
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No orders match.</div>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Order</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Customer</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Payment</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  Total
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  {' '}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {o.orderNumber}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-800 dark:text-zinc-200">{o.customerEmail}</div>
                    {o.customerName ? (
                      <div className="text-xs text-zinc-500">{o.customerName}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {statusPill(o.status, orderStatusTone(o.status))}
                  </td>
                  <td className="px-4 py-3">
                    {statusPill(
                      o.paymentStatus ?? '—',
                      paymentTone(o.paymentStatus),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-50">
                    {money(o.grandTotal, o.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/orders/${o.id}`}
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

      {meta.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            {meta.total} orders · Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  fetchAdminOrders,
  deleteAdminOrder,
  downloadBulkShippingLabels,
  downloadBulkPackageInserts,
  orderStatusLabel,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/api/orders';
import { formatApiError } from '@/lib/api/error-message';
import { formatPrice } from '@/lib/currency';
import { InvoiceModal } from '@/components/orders/InvoiceModal';
import { PermissionGate } from '@/components/permission-gate';

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
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
  if (s === 'processing' || s === 'ready_for_pickup') return 'warning';
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [insertsLoading, setInsertsLoading] = useState(false);
  const [labelsError, setLabelsError] = useState<string | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, customerIdFromUrl, statusFilter, paymentFilter, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [customerIdFromUrl, statusFilter, paymentFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

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

  const allVisibleSelected =
    rows.length > 0 && rows.every((order) => selectedIds.has(order.id));
  const someVisibleSelected = rows.some((order) => selectedIds.has(order.id));

  const toggleSelectAll = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        const next = new Set(current);
        rows.forEach((order) => next.delete(order.id));
        return next;
      }
      const next = new Set(current);
      rows.forEach((order) => next.add(order.id));
      return next;
    });
  };

  const toggleSelectOne = (orderId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleDownloadLabels = async () => {
    const orderIds = [...selectedIds];
    if (orderIds.length === 0) return;

    setLabelsError(null);
    setLabelsLoading(true);
    try {
      await downloadBulkShippingLabels(orderIds);
    } catch (e) {
      setLabelsError(formatApiError(e));
    } finally {
      setLabelsLoading(false);
    }
  };

  const handleDownloadInserts = async () => {
    const orderIds = [...selectedIds];
    if (orderIds.length === 0) return;

    setLabelsError(null);
    setInsertsLoading(true);
    try {
      await downloadBulkPackageInserts(orderIds);
    } catch (e) {
      setLabelsError(formatApiError(e));
    } finally {
      setInsertsLoading(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeletingId(target.id);
    try {
      await deleteAdminOrder(target.id);
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(target.id);
        return next;
      });
      setDeleteTarget(null);
      setToast({
        kind: 'success',
        message: `Order ${target.orderNumber} deleted successfully.`,
      });
      await load();
    } catch (e) {
      setToast({ kind: 'error', message: formatApiError(e) });
    } finally {
      setDeletingId(null);
    }
  };

  const bulkBusy = labelsLoading || insertsLoading;
  const deleteBusy = deletingId !== null;

  return (
    <div className="mx-auto max-w-6xl">
      {toast ? (
        <div
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg border px-3 py-2 text-sm shadow-lg ${
            toast.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-order-title"
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
            <h2
              id="delete-order-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Delete order
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to permanently delete order #{deleteTarget.orderNumber}? This
              cannot be undone.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => void confirmDeleteOrder()}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
              >
                {deletingId === deleteTarget.id ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
            <option value="ready_for_pickup">Ready for Pickup</option>
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

      {selectedIds.size > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900/50">
          <span className="text-zinc-700 dark:text-zinc-300">
            {selectedIds.size} order{selectedIds.size === 1 ? '' : 's'} selected
          </span>
          <button
            type="button"
            disabled={bulkBusy || deleteBusy}
            onClick={() => void handleDownloadLabels()}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {labelsLoading ? 'Generating labels…' : 'Download shipping labels'}
          </button>
          <button
            type="button"
            disabled={bulkBusy || deleteBusy}
            onClick={() => void handleDownloadInserts()}
            className="rounded-lg bg-blue-700 px-3 py-1.5 font-medium text-white disabled:opacity-50"
          >
            {insertsLoading ? 'Generating inserts…' : 'Download package inserts'}
          </button>
          <button
            type="button"
            disabled={bulkBusy || deleteBusy}
            onClick={() => setSelectedIds(new Set())}
            className="font-medium text-zinc-700 underline disabled:opacity-50 dark:text-zinc-300"
          >
            Clear selection
          </button>
        </div>
      ) : null}

      {labelsError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {labelsError}
        </p>
      ) : null}

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
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all orders on this page"
                    checked={allVisibleSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someVisibleSelected && !allVisibleSelected;
                      }
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Order</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Customer</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Payment</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  Total
                </th>
                <th className="min-w-[200px] px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select order ${o.orderNumber}`}
                      checked={selectedIds.has(o.id)}
                      onChange={() => toggleSelectOne(o.id)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                  </td>
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
                    {statusPill(orderStatusLabel(o.status), orderStatusTone(o.status))}
                  </td>
                  <td className="px-4 py-3">
                    {statusPill(
                      o.paymentStatus ?? '—',
                      paymentTone(o.paymentStatus),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-50">
                    {formatPrice(o.grandTotal, o.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-nowrap items-center justify-end gap-x-3 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={bulkBusy || deleteBusy}
                        onClick={() => {
                          setLabelsError(null);
                          setLabelsLoading(true);
                          void downloadBulkShippingLabels([o.id])
                            .catch((e) => setLabelsError(formatApiError(e)))
                            .finally(() => setLabelsLoading(false));
                        }}
                        className="text-sm font-medium text-zinc-900 underline disabled:opacity-40 dark:text-zinc-100"
                      >
                        Label
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvoiceOrder(o)}
                        className="text-sm font-medium text-indigo-600 underline hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Invoice
                      </button>
                      <Link
                        href={`/orders/${o.id}`}
                        className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
                      >
                        Open
                      </Link>
                      <PermissionGate anyOf={['orders.delete', 'orders.manage']}>
                        <button
                          type="button"
                          disabled={bulkBusy || deleteBusy}
                          onClick={() => setDeleteTarget(o)}
                          className="inline-flex items-center justify-center rounded-md p-1 text-red-700 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                          title={`Delete order ${o.orderNumber}`}
                          aria-label={`Delete order ${o.orderNumber}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </PermissionGate>
                    </div>
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
              disabled={page <= 1 || loading || deleteBusy}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages || loading || deleteBusy}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <InvoiceModal
        order={invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
    </div>
  );
}

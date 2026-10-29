'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  fetchAdminOrders,
  deleteAdminOrder,
  bulkDeleteAdminOrders,
  downloadBulkShippingLabels,
  downloadBulkPackageInserts,
  isManualOrderEditable,
  orderStatusLabel,
  paymentStatusLabel,
  type Order,
  type OrderCityRegion,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/api/orders';
import {
  bookOrderWithLeopards,
  bulkBookLeopardsOrders,
  openBulkLeopardsLabelsPdf,
  type BookLeopardsShipmentType,
  type BulkBookLeopardsResult,
} from '@/lib/api/shipping';
import { formatApiError } from '@/lib/api/error-message';
import { formatPrice } from '@/lib/currency';
import { InvoiceModal } from '@/components/orders/InvoiceModal';
import { BulkBookLeopardsSummaryModal } from '@/components/orders/bulk-leopards-actions';
import { PermissionGate } from '@/components/permission-gate';
import { adminUi } from '@/lib/admin-ui';
import {
  orderStatusTone,
  paymentStatusTone,
  statusPillClass,
  type StatusTone,
} from '@/lib/status-tones';

const LEOPARDS_SERVICE_TYPE_OPTIONS: Array<{
  value: BookLeopardsShipmentType;
  label: string;
}> = [
  { value: 'OVERNIGHT', label: 'Overnight (Air)' },
  { value: 'OVERLAND', label: 'Overland (Surface / Cargo)' },
  { value: 'DETAIN', label: 'Economy' },
];

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

function statusPill(label: string, tone: StatusTone) {
  return <span className={statusPillClass(tone)}>{label}</span>;
}

export function OrdersList() {
  const searchParams = useSearchParams();
  const customerIdFromUrl = searchParams.get('customerId')?.trim() || '';

  const [rows, setRows] = useState<Order[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [cityRegion, setCityRegion] = useState<OrderCityRegion | ''>('');
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
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bulkBookLoading, setBulkBookLoading] = useState(false);
  const [bulkLeopardsLabelsLoading, setBulkLeopardsLabelsLoading] =
    useState(false);
  const [bulkShipmentType, setBulkShipmentType] =
    useState<BookLeopardsShipmentType>('OVERNIGHT');
  const [bulkBookSummary, setBulkBookSummary] =
    useState<BulkBookLeopardsResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, customerIdFromUrl, search, cityRegion, statusFilter, paymentFilter, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [customerIdFromUrl, search, cityRegion, statusFilter, paymentFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetchAdminOrders(
          {
            ...(customerIdFromUrl ? { customerId: customerIdFromUrl } : {}),
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(cityRegion ? { cityRegion } : {}),
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(paymentFilter ? { paymentStatus: paymentFilter } : {}),
            page,
            limit: 20,
            sortBy,
            sortOrder,
          },
          signal ? { signal } : undefined,
        );
        if (signal?.aborted) return;
        setRows(res.data);
        setMeta(res.meta);
      } catch (e) {
        if (signal?.aborted) return;
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError(formatApiError(e));
        setRows([]);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [
      customerIdFromUrl,
      search,
      cityRegion,
      statusFilter,
      paymentFilter,
      sortBy,
      sortOrder,
      page,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
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

  const confirmBulkDeleteOrders = async () => {
    const orderIds = [...selectedIds];
    if (orderIds.length === 0) return;

    setBulkDeleting(true);
    try {
      const result = await bulkDeleteAdminOrders(orderIds);
      setBulkDeleteConfirmOpen(false);
      setSelectedIds(new Set());
      setToast({
        kind: result.failedCount > 0 ? 'error' : 'success',
        message:
          result.failedCount > 0
            ? `Deleted ${result.deletedCount} order(s); ${result.failedCount} failed.`
            : `Deleted ${result.deletedCount} selected order(s).`,
      });
      await load();
    } catch (e) {
      setToast({ kind: 'error', message: formatApiError(e) });
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBookLeopards = async (order: Order) => {
    const msg = `Book order ${order.orderNumber} via Leopards Courier?\n\nService type: Overnight (Air)`;
    if (!window.confirm(msg)) return;
    setBookingId(order.id);
    try {
      const result = await bookOrderWithLeopards(order.id, {
        serviceType: 'OVERNIGHT',
        shipmentType: 'OVERNIGHT',
      });
      setToast({
        kind: 'success',
        message: `Booked ${order.orderNumber}. CN: ${result.trackingNumber}`,
      });
      await load();
    } catch (e) {
      setToast({ kind: 'error', message: formatApiError(e) });
    } finally {
      setBookingId(null);
    }
  };

  const handleBulkBookLeopards = async () => {
    const orderIds = [...selectedIds];
    if (orderIds.length === 0) {
      setLabelsError('Select at least one order to book with Leopards.');
      return;
    }
    const serviceLabel =
      LEOPARDS_SERVICE_TYPE_OPTIONS.find((o) => o.value === bulkShipmentType)
        ?.label ?? bulkShipmentType;
    if (
      !window.confirm(
        `Bulk book ${orderIds.length} order(s) via Leopards?\n\nService type: ${serviceLabel}\nAlready-booked orders will be skipped.`,
      )
    ) {
      return;
    }

    setLabelsError(null);
    setBulkBookLoading(true);
    try {
      const summary = await bulkBookLeopardsOrders({
        orderIds,
        serviceType: bulkShipmentType,
        shipmentType: bulkShipmentType,
      });
      setBulkBookSummary(summary);
      setToast({
        kind: summary.failedCount > 0 ? 'error' : 'success',
        message: `Leopards bulk book: ${summary.successCount} booked, ${summary.skippedCount} skipped, ${summary.failedCount} failed.`,
      });
      await load();
    } catch (e) {
      setLabelsError(formatApiError(e));
    } finally {
      setBulkBookLoading(false);
    }
  };

  const handleBulkPrintLeopardsLabels = async () => {
    const orderIds = [...selectedIds];
    if (orderIds.length === 0) {
      setLabelsError('Select at least one order to print Leopards labels.');
      return;
    }

    setLabelsError(null);
    setBulkLeopardsLabelsLoading(true);
    try {
      await openBulkLeopardsLabelsPdf(orderIds);
      setToast({
        kind: 'success',
        message:
          'Opened compiled Leopards shipping label slips for selected orders with CN.',
      });
    } catch (e) {
      setLabelsError(formatApiError(e));
    } finally {
      setBulkLeopardsLabelsLoading(false);
    }
  };

  const handlePrintLeopardsLabel = async (order: Order) => {
    const hasCn = Boolean(order.shipping?.trackingNumber?.trim());
    setLabelsError(null);
    setLabelsLoading(true);
    try {
      if (hasCn) {
        await openBulkLeopardsLabelsPdf([order.id]);
      } else {
        await downloadBulkShippingLabels([order.id]);
      }
    } catch (e) {
      setLabelsError(formatApiError(e));
    } finally {
      setLabelsLoading(false);
    }
  };

  const bulkBusy =
    labelsLoading ||
    insertsLoading ||
    bulkBookLoading ||
    bulkLeopardsLabelsLoading ||
    bulkDeleting;
  const deleteBusy = deletingId !== null || bulkDeleting;
  const bookingBusy = bookingId !== null;

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

      {bulkDeleteConfirmOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-delete-orders-title"
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
            <h2
              id="bulk-delete-orders-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Delete selected orders
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete {selectedIds.size} selected order
              {selectedIds.size === 1 ? '' : 's'}? This cannot be undone.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={bulkDeleting}
                onClick={() => setBulkDeleteConfirmOpen(false)}
                className={adminUi.btnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkDeleting}
                onClick={() => void confirmBulkDeleteOrders()}
                className={adminUi.btnDestructive}
              >
                {bulkDeleting ? 'Deleting…' : 'Delete Selected Orders'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Orders
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Operational list with status filters. Pagination is server-side via the API.
          </p>
        </div>
        <PermissionGate anyOf={['orders.create', 'orders.manage']}>
          <Link href="/orders/new" className={`${adminUi.btnPrimary} shrink-0`}>
            Create manual order
          </Link>
        </PermissionGate>
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 w-full flex-1 basis-full sm:min-w-[200px] sm:basis-[220px] lg:basis-[280px]">
          <label
            htmlFor="orders-search"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Search
          </label>
          <div className="relative mt-1">
            <input
              id="orders-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search orders..."
              autoComplete="off"
              className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-9 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              aria-label="Search orders"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
                className="absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
        <div className="w-full sm:w-48">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            City / Region
          </label>
          <select
            value={cityRegion}
            onChange={(e) => {
              setCityRegion(e.target.value as OrderCityRegion | '');
              setPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">All</option>
            <option value="karachi">Karachi</option>
            <option value="out_of_karachi">Out of Karachi</option>
          </select>
        </div>
        <div className="w-full sm:w-44">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Order status
          </label>
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
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Direction
          </label>
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
          <PermissionGate anyOf={['shipping.manage', 'orders.manage']}>
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              Service
              <select
                value={bulkShipmentType}
                disabled={bulkBusy || deleteBusy || bookingBusy}
                onChange={(e) =>
                  setBulkShipmentType(e.target.value as BookLeopardsShipmentType)
                }
                className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {LEOPARDS_SERVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={bulkBusy || deleteBusy || bookingBusy}
              onClick={() => void handleBulkBookLeopards()}
              className="rounded-lg bg-emerald-700 px-3 py-1.5 font-medium text-white disabled:opacity-50"
            >
              {bulkBookLoading
                ? 'Booking with Leopards…'
                : 'Bulk Book via Leopards'}
            </button>
          </PermissionGate>
          <button
            type="button"
            disabled={bulkBusy || deleteBusy || bookingBusy}
            onClick={() => void handleBulkPrintLeopardsLabels()}
            className="rounded-lg bg-sky-700 px-3 py-1.5 font-medium text-white disabled:opacity-50"
          >
            {bulkLeopardsLabelsLoading
              ? 'Generating PDF…'
              : 'Bulk Print Leopards Labels'}
          </button>
          <button
            type="button"
            disabled={bulkBusy || deleteBusy || bookingBusy}
            onClick={() => void handleDownloadLabels()}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {labelsLoading ? 'Generating labels…' : 'Download shipping labels'}
          </button>
          <button
            type="button"
            disabled={bulkBusy || deleteBusy || bookingBusy}
            onClick={() => void handleDownloadInserts()}
            className="rounded-lg bg-blue-700 px-3 py-1.5 font-medium text-white disabled:opacity-50"
          >
            {insertsLoading ? 'Generating inserts…' : 'Download package inserts'}
          </button>
          <PermissionGate anyOf={['orders.delete', 'orders.manage']}>
            <button
              type="button"
              disabled={bulkBusy || deleteBusy || bookingBusy}
              onClick={() => setBulkDeleteConfirmOpen(true)}
              className={adminUi.btnDestructive}
            >
              {bulkDeleting ? 'Deleting…' : 'Delete Selected Orders'}
            </button>
          </PermissionGate>
          <button
            type="button"
            disabled={bulkBusy || deleteBusy || bookingBusy}
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
            <thead className={adminUi.tableHead}>
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
                    className="h-4 w-4 rounded border-border"
                  />
                </th>
                <th className={adminUi.tableHeadCell}>Order</th>
                <th className={adminUi.tableHeadCell}>Customer</th>
                <th className={adminUi.tableHeadCell}>Status</th>
                <th className={adminUi.tableHeadCell}>Payment</th>
                <th className={`${adminUi.tableHeadCell} text-right`}>Total</th>
                <th className={`min-w-[200px] ${adminUi.tableHeadCell} text-right`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((o) => (
                <tr key={o.id} className={adminUi.tableRow}>
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
                    <div className="font-mono text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
                      {o.orderNumber}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                    {o.shipping?.trackingNumber ? (
                      <div className="mt-0.5 font-mono text-xs text-sky-700 dark:text-sky-400">
                        CN:{' '}
                        <a
                          href={
                            o.shipping.trackingUrl?.trim() ||
                            `https://www.leopardscourier.com/tracking/?cn=${encodeURIComponent(o.shipping.trackingNumber)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                          title="Open Leopards online tracking"
                        >
                          {o.shipping.trackingNumber}
                        </a>
                      </div>
                    ) : null}
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
                      paymentStatusLabel(o.paymentStatus),
                      paymentStatusTone(o.paymentStatus),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-medium tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
                    {formatPrice(o.grandTotal, o.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-nowrap items-center justify-end gap-3 whitespace-nowrap">
                      {(o.status === 'pending' || o.status === 'processing') &&
                      !o.shipping?.trackingNumber ? (
                        <PermissionGate anyOf={['shipping.manage', 'orders.manage']}>
                          <button
                            type="button"
                            disabled={bulkBusy || deleteBusy || bookingBusy}
                            onClick={() => void handleBookLeopards(o)}
                            className="text-sm font-medium text-sky-700 underline disabled:opacity-40 dark:text-sky-400"
                          >
                            {bookingId === o.id ? 'Booking…' : 'Leopards'}
                          </button>
                        </PermissionGate>
                      ) : null}
                      <button
                        type="button"
                        disabled={bulkBusy || deleteBusy || bookingBusy}
                        onClick={() => void handlePrintLeopardsLabel(o)}
                        className="text-sm font-medium text-zinc-900 underline disabled:opacity-50 dark:text-zinc-100"
                        title={
                          o.shipping?.trackingNumber
                            ? 'Open printable Leopards label slip'
                            : 'Download shipping label'
                        }
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
                      {isManualOrderEditable(o) ? (
                        <PermissionGate anyOf={['orders.update', 'orders.manage']}>
                          <Link
                            href={`/orders/${o.id}/edit`}
                            className="text-sm font-medium text-amber-700 underline dark:text-amber-300"
                          >
                            Edit
                          </Link>
                        </PermissionGate>
                      ) : null}
                      <Link
                        href={`/orders/${o.id}`}
                        className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
                      >
                        Open
                      </Link>
                      <PermissionGate anyOf={['orders.delete', 'orders.manage']}>
                        <button
                          type="button"
                          disabled={bulkBusy || deleteBusy || bookingBusy}
                          onClick={() => setDeleteTarget(o)}
                          className={`${adminUi.btnDestructive} !px-2 !py-1.5`}
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

      {bulkBookSummary ? (
        <BulkBookLeopardsSummaryModal
          summary={bulkBookSummary}
          onClose={() => setBulkBookSummary(null)}
        />
      ) : null}
    </div>
  );
}

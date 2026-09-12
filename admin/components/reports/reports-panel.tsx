'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  downloadCsv,
  fetchItemBreakdownReport,
  fetchOrderSummaryReport,
  type ItemBreakdownReportRow,
  type OrderSummaryReportRow,
} from '@/lib/api/reports';
import { formatApiError } from '@/lib/api/error-message';
import { formatPrice } from '@/lib/currency';
import { orderStatusLabel } from '@/lib/api/orders';
import { usePermissions } from '@/lib/use-permissions';
import { NoAccessPanel } from '@/components/permission-gate';

type TabId = 'summary' | 'items';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIsoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function ReportsPanel() {
  const { ready, can } = usePermissions();
  const canRead = can('reports', 'read');

  const [tab, setTab] = useState<TabId>('summary');
  const [startDate, setStartDate] = useState(() => daysAgoIsoDate(30));
  const [endDate, setEndDate] = useState(() => todayIsoDate());
  const [summary, setSummary] = useState<OrderSummaryReportRow[]>([]);
  const [items, setItems] = useState<ItemBreakdownReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => ({ startDate, endDate }), [startDate, endDate]);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    setError(null);
    try {
      const [s, i] = await Promise.all([
        fetchOrderSummaryReport(range),
        fetchItemBreakdownReport(range),
      ]);
      setSummary(s);
      setItems(i);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [canRead, range]);

  useEffect(() => {
    if (!ready || !canRead) return;
    void load();
  }, [ready, canRead, load]);

  function exportSummary() {
    downloadCsv(
      `order-summary_${startDate}_${endDate}.csv`,
      [
        'Customer Name',
        'Email',
        'Phone',
        'Shipping Address',
        'Order No',
        'Total Items',
        'Order Total',
        'Order Status',
        'Payment Status',
        'Completion Status',
        'Created At',
      ],
      summary.map((r) => [
        r.customerName,
        r.customerEmail,
        r.customerPhone,
        r.shippingAddress,
        r.orderNumber,
        r.totalItemsCount,
        r.orderTotal,
        r.orderStatus,
        r.paymentStatus,
        r.completionStatus,
        r.createdAt,
      ]),
    );
  }

  function exportItems() {
    downloadCsv(
      `item-breakdown_${startDate}_${endDate}.csv`,
      [
        'Order No',
        'Item Name',
        'Quantity',
        'Unit Price',
        'Row Total',
        'Order Total',
        'Created At',
      ],
      items.map((r) => [
        r.orderNumber,
        r.itemName,
        r.quantity,
        r.unitPrice,
        r.rowTotal,
        r.orderTotal,
        r.createdAt,
      ]),
    );
  }

  if (ready && !canRead) {
    return <NoAccessPanel requiredKeys={['reports.read']} />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Reports
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Order summary and line-item breakdown for the selected date range.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Start
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            End
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={adminUi.btnSecondary}
          >
            {loading ? 'Loading…' : 'Apply'}
          </button>
          <button
            type="button"
            onClick={tab === 'summary' ? exportSummary : exportItems}
            disabled={loading || (tab === 'summary' ? summary.length === 0 : items.length === 0)}
            className={adminUi.btnPrimary}
          >
            Export to CSV
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {(
          [
            { id: 'summary' as const, label: 'Summary' },
            { id: 'items' as const, label: 'Item Breakdown' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-50'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {tab === 'summary' ? (
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                {[
                  'Customer',
                  'Email',
                  'Phone',
                  'Shipping',
                  'Order No',
                  'Items',
                  'Total',
                  'Order Status',
                  'Payment',
                  'Completion',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading && summary.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-zinc-500">
                    Loading…
                  </td>
                </tr>
              ) : summary.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-zinc-500">
                    No orders in this range.
                  </td>
                </tr>
              ) : (
                summary.map((r) => (
                  <tr key={r.orderNumber}>
                    <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                      {r.customerName}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {r.customerEmail}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {r.customerPhone ?? '—'}
                    </td>
                    <td
                      className="max-w-[12rem] truncate px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400"
                      title={r.shippingAddress}
                    >
                      {r.shippingAddress}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.orderNumber}</td>
                    <td className="px-3 py-2 tabular-nums">{r.totalItemsCount}</td>
                    <td className="px-3 py-2 tabular-nums font-medium">
                      {formatPrice(r.orderTotal, r.currency)}
                    </td>
                    <td className="px-3 py-2">{orderStatusLabel(r.orderStatus)}</td>
                    <td className="px-3 py-2 capitalize">{r.paymentStatus}</td>
                    <td className="px-3 py-2 capitalize">
                      {r.completionStatus.replace(/_/g, ' ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                {[
                  'Order No',
                  'Item Name',
                  'Qty',
                  'Unit Price',
                  'Row Total',
                  'Order Total',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-zinc-500">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-zinc-500">
                    No line items in this range.
                  </td>
                </tr>
              ) : (
                items.map((r, idx) => (
                  <tr key={`${r.orderNumber}-${r.itemName}-${idx}`}>
                    <td className="px-3 py-2 font-mono text-xs">{r.orderNumber}</td>
                    <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">
                      {r.itemName}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{r.quantity}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatPrice(r.unitPrice, r.currency)}
                    </td>
                    <td className="px-3 py-2 tabular-nums font-medium">
                      {formatPrice(r.rowTotal, r.currency)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatPrice(r.orderTotal, r.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

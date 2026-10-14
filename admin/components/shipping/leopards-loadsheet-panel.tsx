'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { adminUi } from '@/lib/admin-ui';
import { formatApiError } from '@/lib/api/error-message';
import {
  fetchLeopardsBookedOrders,
  generateLeopardsLoadsheet,
  type GenerateLoadsheetResult,
  type LoadsheetBookedOrder,
  type LoadsheetOrderStatusFilter,
} from '@/lib/api/shipping';
import { LoadsheetPrintModal } from '@/components/shipping/loadsheet-print-modal';

function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'PKR',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || 'PKR'} ${amount.toFixed(2)}`;
  }
}

function serviceTypeLabel(code: string): string {
  switch (code?.toUpperCase()) {
    case 'OVERLAND':
      return 'Overland (Road)';
    case 'DETAIN':
      return 'Economy (Detain)';
    case 'OVERNIGHT':
    default:
      return 'Overnight (Air)';
  }
}

export function LeopardsLoadsheetPanel() {
  const [dateFrom, setDateFrom] = useState(todayIsoDate);
  const [dateTo, setDateTo] = useState(todayIsoDate);
  const [status, setStatus] =
    useState<LoadsheetOrderStatusFilter>('pending_loadsheet');
  const [rows, setRows] = useState<LoadsheetBookedOrder[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manifest, setManifest] = useState<GenerateLoadsheetResult | null>(
    null,
  );

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchLeopardsBookedOrders({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status,
      });
      setRows(res.data);
      setSelected(new Set());
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async booked-orders fetch on filter change
    void load();
  }, [load]);

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.id)),
    [rows, selected],
  );

  const selectedCodTotal = useMemo(
    () => selectedRows.reduce((sum, r) => sum + (r.codAmount || 0), 0),
    [selectedRows],
  );

  const allSelected =
    rows.length > 0 && rows.every((r) => selected.has(r.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(rows.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGenerate() {
    setError(null);
    setSuccess(null);
    if (selected.size === 0) {
      setError('Select at least one booked order to generate a loadsheet.');
      return;
    }

    const orderIds = [...selected];
    const cnNumbers = selectedRows
      .map((r) => r.cnNumber)
      .filter((cn) => Boolean(cn?.trim()));

    if (
      !window.confirm(
        `Generate Leopards loadsheet for ${orderIds.length} packet(s)?\n\nThis registers the CNs with Leopards for pickup.`,
      )
    ) {
      return;
    }

    setGenerating(true);
    try {
      const result = await generateLeopardsLoadsheet({ orderIds, cnNumbers });
      setManifest(result);
      setSuccess(
        `Loadsheet ${result.loadSheetId} generated for ${result.totals.packetCount} packet(s).`,
      );
      await load();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl pb-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500"
          >
            <Link href="/shipping" className={adminUi.link}>
              Shipping
            </Link>
            <span aria-hidden>/</span>
            <span className="text-zinc-700 dark:text-zinc-300">Loadsheet</span>
            <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
              ·
            </span>
            <Link href="/shipping/loadsheets-history" className={adminUi.link}>
              History
            </Link>
          </nav>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Leopards Loadsheet
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Select booked packets with CN numbers, generate a pickup loadsheet,
            then print the manifest for the courier boy and store manager.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={generating || selected.size === 0}
          className={`${adminUi.btnPrimary} shrink-0`}
        >
          {generating
            ? 'Generating…'
            : `Generate Loadsheet (${selected.size})`}
        </button>
      </div>

      <div className="sticky top-0 z-20 mt-6 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Date from
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Date to
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as LoadsheetOrderStatusFilter)
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="pending_loadsheet">BOOKED (no loadsheet)</option>
              <option value="all">ALL</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className={adminUi.btnSecondary}
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span>
            {selected.size} selected — COD{' '}
            <span className="font-mono font-medium tabular-nums tracking-tight text-zinc-800 dark:text-zinc-200">
              {formatMoney(
                selectedCodTotal,
                selectedRows[0]?.currency || 'PKR',
              )}
            </span>
          </span>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generating || selected.size === 0}
            className={adminUi.btnPrimarySm}
          >
            {generating ? 'Generating…' : 'Generate Loadsheet'}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No booked Leopards orders match these filters.
          </div>
        ) : (
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Order
                </th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Customer
                </th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Destination
                </th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  CN Number
                </th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Service
                </th>
                <th className="px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  COD
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={
                    selected.has(row.id)
                      ? 'bg-zinc-50 dark:bg-zinc-900/40'
                      : undefined
                  }
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleOne(row.id)}
                      aria-label={`Select ${row.orderNumber}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/orders/${row.id}`}
                      className={`${adminUi.link} font-mono text-xs font-medium tracking-tight`}
                    >
                      {row.orderNumber}
                    </Link>
                    {row.loadSheetId ? (
                      <div className="mt-1 inline-flex max-w-full items-center rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[10px] tracking-tight text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        LS: {row.loadSheetId}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-zinc-800 dark:text-zinc-100">
                    {row.customerName}
                  </td>
                  <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {row.destinationCity}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {row.cnNumber}
                  </td>
                  <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {serviceTypeLabel(row.serviceType)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-xs font-medium tabular-nums tracking-tight text-zinc-800 dark:text-zinc-100">
                    {formatMoney(row.codAmount, row.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 md:left-64">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {selected.size} packet(s) selected · Total COD{' '}
            <span className="font-mono font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
              {formatMoney(
                selectedCodTotal,
                selectedRows[0]?.currency || 'PKR',
              )}
            </span>
          </p>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generating || selected.size === 0}
            className={adminUi.btnPrimary}
          >
            {generating ? 'Generating…' : 'Generate Loadsheet'}
          </button>
        </div>
      </div>

      {manifest ? (
        <LoadsheetPrintModal
          manifest={manifest}
          onClose={() => setManifest(null)}
        />
      ) : null}
    </div>
  );
}

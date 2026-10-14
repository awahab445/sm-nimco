'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminUi } from '@/lib/admin-ui';
import { formatApiError } from '@/lib/api/error-message';
import {
  fetchLeopardsLoadsheetHistory,
  fetchLeopardsLoadsheetManifest,
  openLeopardsLoadsheetReprintPdf,
  type GenerateLoadsheetResult,
  type LoadsheetHistoryRow,
} from '@/lib/api/shipping';
import { LoadsheetPrintModal } from '@/components/shipping/loadsheet-print-modal';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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

export function LeopardsLoadsheetHistoryPanel() {
  const [rows, setRows] = useState<LoadsheetHistoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [manifest, setManifest] = useState<GenerateLoadsheetResult | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLeopardsLoadsheetHistory();
      setRows(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handlePrintManifest(row: LoadsheetHistoryRow) {
    setBusyId(row.id);
    setError(null);
    try {
      if (row.hasStoredPdf || row.officialUrl) {
        try {
          await openLeopardsLoadsheetReprintPdf(row.id);
          return;
        } catch {
          // Fall through to HTML report reprint.
        }
      }
      const payload = await fetchLeopardsLoadsheetManifest(row.id);
      setManifest(payload);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setBusyId(null);
    }
  }

  async function handleView(row: LoadsheetHistoryRow) {
    setBusyId(row.id);
    setError(null);
    try {
      const payload = await fetchLeopardsLoadsheetManifest(row.id);
      setManifest(payload);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
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
            <Link href="/shipping/loadsheet" className={adminUi.link}>
              Loadsheet
            </Link>
            <span aria-hidden>/</span>
            <span className="text-zinc-700 dark:text-zinc-300">History</span>
          </nav>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Loadsheets History
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Reprint previously generated Leopards loadsheets without creating a
            new booking.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/shipping/loadsheet" className={adminUi.btnSecondary}>
            Generate new
          </Link>
          <button
            type="button"
            className={adminUi.btnSecondary}
            onClick={() => void load()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No loadsheets saved yet. Generate one from the{' '}
            <Link
              href="/shipping/loadsheet"
              className="underline underline-offset-2"
            >
              Loadsheet
            </Link>{' '}
            page.
          </div>
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Loadsheet ID
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Date
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Total Shipments
                </th>
                <th className="px-4 py-3 font-medium text-right text-zinc-700 dark:text-zinc-300">
                  Total COD
                </th>
                <th className="px-4 py-3 font-medium text-right text-zinc-700 dark:text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex max-w-full items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 font-mono text-xs font-medium tracking-tight text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {row.loadSheetId}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm tabular-nums text-zinc-800 dark:text-zinc-100">
                    {row.packetCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-medium tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
                    {formatMoney(row.totalCod ?? 0, row.currency || 'PKR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        className={adminUi.btnSecondary}
                        disabled={busyId === row.id}
                        onClick={() => void handleView(row)}
                      >
                        {busyId === row.id ? 'Opening…' : 'View'}
                      </button>
                      <button
                        type="button"
                        className={adminUi.btnPrimary}
                        disabled={busyId === row.id}
                        onClick={() => void handlePrintManifest(row)}
                      >
                        {busyId === row.id ? 'Opening…' : 'Print Manifest'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && total > 0 ? (
        <p className="mt-3 text-xs text-zinc-500">
          Showing {rows.length} of {total} loadsheet(s).
        </p>
      ) : null}

      {manifest ? (
        <LoadsheetPrintModal
          manifest={manifest}
          onClose={() => setManifest(null)}
        />
      ) : null}
    </div>
  );
}

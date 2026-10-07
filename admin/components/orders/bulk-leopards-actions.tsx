'use client';

import { adminUi } from '@/lib/admin-ui';
import type { BulkBookLeopardsResult } from '@/lib/api/shipping';

export function BulkBookLeopardsSummaryModal({
  summary,
  onClose,
}: {
  summary: BulkBookLeopardsResult;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Bulk Leopards Booking Summary
            </h2>
            <p className="text-xs text-zinc-500">
              {summary.successCount} booked · {summary.skippedCount} skipped ·{' '}
              {summary.failedCount} failed
            </p>
          </div>
          <button type="button" onClick={onClose} className={adminUi.btnSecondary}>
            Close
          </button>
        </div>
        <ul className="max-h-[60vh] divide-y divide-zinc-200 overflow-y-auto dark:divide-zinc-800">
          {summary.results.map((row) => (
            <li key={row.orderId} className="px-4 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {row.orderNumber || row.orderId}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    row.status === 'booked'
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
                      : row.status === 'skipped'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                        : 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200'
                  }`}
                >
                  {row.status}
                </span>
              </div>
              {row.cnNumber ? (
                <p className="mt-0.5 font-mono text-xs text-zinc-500">
                  CN:{' '}
                  {row.trackingUrl ? (
                    <a
                      href={row.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {row.cnNumber}
                    </a>
                  ) : (
                    row.cnNumber
                  )}
                </p>
              ) : null}
              {row.error ? (
                <p className="mt-0.5 text-xs text-zinc-500">{row.error}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { adminUi } from '@/lib/admin-ui';
import type { LeopardsTrackResult } from '@/lib/api/shipping';

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('deliver')) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200';
  }
  if (s.includes('return') || s.includes('cancel') || s.includes('fail')) {
    return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200';
  }
  if (s.includes('transit') || s.includes('dispatch') || s.includes('assign')) {
    return 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200';
  }
  if (s.includes('book') || s.includes('pick')) {
    return 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200';
  }
  return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
}

export type TrackShipmentModalProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  result: LeopardsTrackResult | null;
  /** Fallback CN shown in header while loading / before first response. */
  trackingNumber?: string | null;
  onRefresh: () => void;
  onClose: () => void;
};

export function TrackShipmentModal({
  open,
  loading,
  error,
  result,
  trackingNumber,
  onRefresh,
  onClose,
}: TrackShipmentModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const events = result?.events ?? [];
  // Newest first for timeline readability when API returns chronological order.
  const timeline = [...events].reverse();
  const awaitingScan =
    Boolean(result) &&
    (result!.success === false || timeline.length === 0) &&
    !error;
  const cnDisplay =
    result?.cnNumber || trackingNumber?.trim() || 'Loading CN…';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close track shipment"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-shipment-title"
        className="relative my-8 w-full max-w-xl rounded-xl bg-white shadow-xl dark:bg-zinc-950"
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <h3
              id="track-shipment-title"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Track Shipment
            </h3>
            <p className="mt-0.5 font-mono text-xs text-zinc-500">{cnDisplay}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className={adminUi.btnSecondary}
            >
              {loading ? 'Refreshing…' : 'Refresh Status'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={adminUi.btnSecondary}
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {awaitingScan && result ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                  Booked - Awaiting Courier Scan
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  CN: {result.cnNumber}
                </span>
              </div>
              <p className="mt-2 text-sm text-amber-950/80 dark:text-amber-100/90">
                {result.message ||
                  'Tracking details not yet scanned or unavailable on Staging.'}
              </p>
              <p className="mt-1 text-xs text-amber-900/70 dark:text-amber-200/70">
                Staging CN numbers show tracking updates once scanned at Leopards
                hub.
              </p>
            </div>
          ) : null}

          {result && !awaitingScan ? (
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(result.currentStatus)}`}
              >
                {result.currentStatus}
              </span>
              {result.destination ? (
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  Destination:{' '}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {result.destination}
                  </span>
                </span>
              ) : null}
              {result.consigneeName ? (
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  Consignee:{' '}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {result.consigneeName}
                  </span>
                </span>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : null}

          {loading && !result ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              Fetching live tracking from Leopards…
            </p>
          ) : null}

          {timeline.length > 0 ? (
            <ol className="relative space-y-0 border-l border-zinc-200 pl-4 dark:border-zinc-700">
              {timeline.map((event, idx) => (
                <li
                  key={`${event.activityAt}-${idx}`}
                  className="relative pb-5 last:pb-0"
                >
                  <span className="absolute -left-[1.15rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-zinc-900 dark:border-zinc-950 dark:bg-zinc-100" />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {event.status}
                    </p>
                    <time className="text-[11px] tabular-nums text-zinc-500">
                      {event.activityAt ||
                        [event.activityDate, event.activityTime]
                          .filter(Boolean)
                          .join(' ') ||
                        '—'}
                    </time>
                  </div>
                  {event.location ? (
                    <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      Location: {event.location}
                    </p>
                  ) : null}
                  {event.remarks ? (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Remarks: {event.remarks}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}

          {result?.trackedAt ? (
            <p className="text-[11px] text-zinc-400">
              Last checked {new Date(result.trackedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

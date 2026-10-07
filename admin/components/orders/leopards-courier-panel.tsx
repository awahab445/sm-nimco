'use client';

import { useState } from 'react';
import { adminUi } from '@/lib/admin-ui';
import {
  getLeopardsShippingDetails,
  type Order,
} from '@/lib/api/orders';
import {
  bookOrderWithLeopards,
  openBulkLeopardsLabelsPdf,
  type BookLeopardsShipmentType,
} from '@/lib/api/shipping';
import { formatApiError } from '@/lib/api/error-message';
import { PermissionGate } from '@/components/permission-gate';

const SERVICE_TYPE_OPTIONS: Array<{
  value: BookLeopardsShipmentType;
  label: string;
}> = [
  { value: 'OVERNIGHT', label: 'Overnight (Air)' },
  { value: 'OVERLAND', label: 'Overland (Surface / Cargo)' },
  { value: 'DETAIN', label: 'Economy' },
];

function PrintIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function LeopardsCourierPanel({
  order,
  onOrderUpdated,
}: {
  order: Order;
  onOrderUpdated: () => void | Promise<void>;
}) {
  const [booking, setBooking] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shipmentType, setShipmentType] =
    useState<BookLeopardsShipmentType>('OVERNIGHT');

  const {
    trackingNumber,
    trackingUrl,
    slipUrl,
    loadSheetId,
  } = getLeopardsShippingDetails(order.shipping);
  const hasCn = Boolean(trackingNumber);
  const canBook =
    !hasCn &&
    (order.status === 'pending' || order.status === 'processing');

  async function handleBook() {
    setError(null);
    setSuccess(null);
    const serviceLabel =
      SERVICE_TYPE_OPTIONS.find((o) => o.value === shipmentType)?.label ??
      shipmentType;
    if (
      !window.confirm(
        `Book order ${order.orderNumber} with Leopards Courier?\n\nService type: ${serviceLabel}\n\nThis creates a CN and shipping label via the Leopards API.`,
      )
    ) {
      return;
    }

    setBooking(true);
    try {
      const result = await bookOrderWithLeopards(order.id, {
        serviceType: shipmentType,
        shipmentType,
      });
      setSuccess(
        result.trackingNumber
          ? `Booked successfully. CN: ${result.trackingNumber}`
          : 'Booked successfully with Leopards Courier.',
      );
      await onOrderUpdated();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBooking(false);
    }
  }

  async function handleCopyTracking() {
    if (!trackingNumber) return;
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy tracking number to clipboard.');
    }
  }

  async function handlePrintLabel() {
    setError(null);
    if (slipUrl) {
      window.open(slipUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setPrinting(true);
    try {
      await openBulkLeopardsLabelsPdf([order.id]);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setPrinting(false);
    }
  }

  function handleTrackShipment() {
    if (!trackingUrl && !trackingNumber) return;
    const url =
      trackingUrl ||
      `https://www.leopardscourier.com/tracking/?cn=${encodeURIComponent(trackingNumber!)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  if (!hasCn && !canBook) {
    return null;
  }

  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Leopards Courier
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            {hasCn
              ? 'CN generated. Print the shipping label or track the shipment.'
              : 'Book a packet to generate a CN and downloadable shipping label slip.'}
          </p>
        </div>
      </div>

      {hasCn ? (
        <div className="mt-4 space-y-3">
          {trackingNumber ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Tracking CN
              </span>
              <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {trackingNumber}
              </span>
              <button
                type="button"
                onClick={() => void handleCopyTracking()}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-white dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          ) : null}

          {loadSheetId ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Load sheet ID:{' '}
              <span className="font-mono">{loadSheetId}</span>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={printing}
              onClick={() => void handlePrintLabel()}
              className={`${adminUi.btnPrimary} gap-2`}
            >
              <PrintIcon className="h-4 w-4" />
              {printing ? 'Opening label…' : 'Print Shipping Label'}
            </button>
            {trackingNumber ? (
              <button
                type="button"
                onClick={handleTrackShipment}
                className={adminUi.btnSecondary}
              >
                Track Shipment
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <PermissionGate anyOf={['shipping.manage', 'orders.manage']}>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-[12rem] flex-1 sm:max-w-xs">
              <label
                htmlFor="leopards-service-type"
                className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                Service Type
              </label>
              <select
                id="leopards-service-type"
                value={shipmentType}
                onChange={(e) =>
                  setShipmentType(e.target.value as BookLeopardsShipmentType)
                }
                disabled={booking}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {SERVICE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => void handleBook()}
              disabled={booking}
              className={adminUi.btnPrimary}
            >
              {booking ? 'Booking with Leopards…' : 'Book via Leopards Courier'}
            </button>
          </div>
        </PermissionGate>
      )}

      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </p>
      ) : null}
    </section>
  );
}

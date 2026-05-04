'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  assignShippingToOrder,
  fetchMethodsByZone,
  fetchPublicOrderShipping,
  fetchShippingZones,
  updateOrderShippingStatus,
  type OrderShipping,
  type ShippingMethod,
  type ShippingZone,
} from '@/lib/api/shipping';
import { formatApiError } from '@/lib/api/error-message';

export function OrderShippingOps() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [methodId, setMethodId] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignOk, setAssignOk] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const [statusOrderId, setStatusOrderId] = useState('');
  const [status, setStatus] = useState<
    'pending' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled'
  >('shipped');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const [snapshot, setSnapshot] = useState<OrderShipping | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  useEffect(() => {
    void fetchShippingZones({ includeInactive: true }).then(setZones).catch(() => setZones([]));
  }, []);

  const loadMethods = useCallback(async (zoneId: string) => {
    if (!zoneId) {
      setMethods([]);
      setMethodId('');
      return;
    }
    try {
      const m = await fetchMethodsByZone(zoneId, { includeInactive: true });
      setMethods(m);
      setMethodId(m[0]?.id ?? '');
    } catch {
      setMethods([]);
      setMethodId('');
    }
  }, []);

  useEffect(() => {
    void loadMethods(selectedZoneId);
  }, [selectedZoneId, loadMethods]);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setAssignError(null);
    setAssignOk(null);
    if (!orderId.trim()) {
      setAssignError('Order ID is required.');
      return;
    }
    if (!methodId) {
      setAssignError('Select a shipping method.');
      return;
    }
    if (!window.confirm(`Assign this method to order ${orderId.trim()}? (One-time; fails if already assigned.)`)) {
      return;
    }
    setAssigning(true);
    try {
      await assignShippingToOrder(orderId.trim(), methodId);
      setAssignOk('Shipping assigned. Order totals were updated on the server.');
    } catch (err) {
      setAssignError(formatApiError(err));
    } finally {
      setAssigning(false);
    }
  }

  async function handleStatus(e: React.FormEvent) {
    e.preventDefault();
    setStatusError(null);
    setStatusOk(null);
    if (!statusOrderId.trim()) {
      setStatusError('Order ID is required.');
      return;
    }
    if (
      !window.confirm(
        `Update shipping status to “${status}” for order ${statusOrderId.trim()}?`,
      )
    ) {
      return;
    }
    setStatusSaving(true);
    try {
      await updateOrderShippingStatus(statusOrderId.trim(), {
        status,
        ...(trackingNumber.trim() ? { trackingNumber: trackingNumber.trim() } : {}),
        ...(trackingUrl.trim() ? { trackingUrl: trackingUrl.trim() } : {}),
      });
      setStatusOk('Shipping status updated.');
    } catch (err) {
      setStatusError(formatApiError(err));
    } finally {
      setStatusSaving(false);
    }
  }

  async function loadSnapshot(forOrderId: string) {
    setSnapshotError(null);
    setSnapshot(null);
    if (!forOrderId.trim()) {
      setSnapshotError('Enter an order ID.');
      return;
    }
    setSnapshotLoading(true);
    try {
      const s = await fetchPublicOrderShipping(forOrderId.trim());
      setSnapshot(s);
    } catch (err) {
      setSnapshotError(formatApiError(err));
    } finally {
      setSnapshotLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <Link
          href="/shipping"
          className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
        >
          ← Shipping
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Order shipping
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Assign a method to an order that does not have shipping yet, then update tracking status.
          Also available from{' '}
          <Link href="/orders" className="font-medium underline">
            orders
          </Link>
          .
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Load current shipping
        </h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-mono">GET /shipping/order/:orderId</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order UUID"
            className="min-w-[240px] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={() => void loadSnapshot(orderId)}
            disabled={snapshotLoading}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
          >
            {snapshotLoading ? 'Loading…' : 'Fetch'}
          </button>
        </div>
        {snapshotError ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{snapshotError}</p>
        ) : null}
        {snapshot ? (
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-zinc-50 p-3 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        ) : null}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Assign method</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-mono">POST /admin/shipping/orders/:orderId/assign</span>
        </p>
        <form onSubmit={handleAssign} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Order ID</label>
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Zone</label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Select zone…</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Method</label>
              <select
                value={methodId}
                onChange={(e) => setMethodId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {methods.length === 0 ? (
                  <option value="">Choose a zone first</option>
                ) : (
                  methods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} — {m.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          {assignError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{assignError}</p>
          ) : null}
          {assignOk ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{assignOk}</p>
          ) : null}
          <button
            type="submit"
            disabled={assigning}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {assigning ? 'Assigning…' : 'Assign shipping'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Update status</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-mono">PUT /admin/shipping/orders/:orderId/status</span>
        </p>
        <form onSubmit={handleStatus} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Order ID</label>
            <input
              value={statusOrderId}
              onChange={(e) => setStatusOrderId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="pending">pending</option>
              <option value="shipped">shipped</option>
              <option value="in_transit">in_transit</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Tracking number
              </label>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Tracking URL
              </label>
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>
          {statusError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{statusError}</p>
          ) : null}
          {statusOk ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{statusOk}</p>
          ) : null}
          <button
            type="submit"
            disabled={statusSaving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {statusSaving ? 'Saving…' : 'Update status'}
          </button>
        </form>
      </section>
    </div>
  );
}

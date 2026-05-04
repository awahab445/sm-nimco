'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DEFAULT_WAREHOUSE_ID,
  adjustInventoryStock,
  fetchInventoryStatus,
  type InventoryStatusData,
} from '@/lib/api/inventory';
import { formatApiError } from '@/lib/api/error-message';

export function InventoryManager() {
  const [variantId, setVariantId] = useState('');
  const [warehouseId, setWarehouseId] = useState(DEFAULT_WAREHOUSE_ID);
  const [status, setStatus] = useState<InventoryStatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);

  async function loadStatus() {
    setStatusError(null);
    const id = variantId.trim();
    if (!id) {
      setStatusError('Enter a variant ID or simple product ID.');
      return;
    }
    setLoadingStatus(true);
    try {
      const res = await fetchInventoryStatus(id, warehouseId.trim() || undefined);
      setStatus(res.data);
    } catch (e) {
      setStatusError(formatApiError(e));
    } finally {
      setLoadingStatus(false);
    }
  }

  async function submitAdjust(e: React.FormEvent) {
    e.preventDefault();
    setAdjustError(null);
    setAdjustSuccess(null);
    const id = variantId.trim();
    if (!id) {
      setAdjustError('Enter a variant ID or simple product ID first.');
      return;
    }
    const delta = parseInt(adjQty, 10);
    if (!Number.isFinite(delta)) {
      setAdjustError('Adjustment must be a whole number (e.g. 10 or -2).');
      return;
    }
    setAdjusting(true);
    try {
      const res = await adjustInventoryStock({
        variantId: id,
        quantity: delta,
        reason: adjReason.trim() || undefined,
        warehouseId: warehouseId.trim() || DEFAULT_WAREHOUSE_ID,
      });
      setAdjustSuccess(
        `Updated: on-hand ${res.data.previousQuantity} → ${res.data.newQuantity} (available ${res.data.availableQuantity}).`,
      );
      setAdjQty('');
      setAdjReason('');
      await loadStatus();
    } catch (e) {
      setAdjustError(formatApiError(e));
    } finally {
      setAdjusting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Inventory
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Look up stock by <strong>variant ID</strong> (from{' '}
          <Link href="/products" className="font-medium underline">
            Products
          </Link>
          ) or, for simple products with no variants, the <strong>product ID</strong>. Default
          warehouse matches the storefront: <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">{DEFAULT_WAREHOUSE_ID}</code>.
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Lookup</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Variant or product ID
            </label>
            <input
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              placeholder="e.g. uuid from product detail → variants"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Warehouse ID
            </label>
            <input
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <button
            type="button"
            onClick={() => void loadStatus()}
            disabled={loadingStatus}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loadingStatus ? 'Loading…' : 'Load status'}
          </button>
        </div>

        {statusError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {statusError}
          </p>
        ) : null}

        {status ? (
          <dl className="mt-6 grid gap-3 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800 sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">On hand</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-50">{status.quantity}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Reserved</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-50">{status.reservedQuantity}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Available</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-50">{status.availableQuantity}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Low-stock threshold</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-50">{status.lowStockThreshold}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">Flags</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {status.isLowStock ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                    Low stock
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Above threshold
                  </span>
                )}
                {status.isInStock ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                    In stock
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                    No available qty
                  </span>
                )}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Adjust stock</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Enter a signed integer: positive to receive stock, negative to shrink. Cannot go below zero on hand.
        </p>
        <form onSubmit={(e) => void submitAdjust(e)} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Quantity delta</label>
            <input
              type="number"
              step={1}
              value={adjQty}
              onChange={(e) => setAdjQty(e.target.value)}
              placeholder="e.g. 25 or -3"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Reason (optional)</label>
            <input
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              placeholder="e.g. PO #1234, cycle count correction"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <button
            type="submit"
            disabled={adjusting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {adjusting ? 'Applying…' : 'Apply adjustment'}
          </button>
        </form>

        {adjustError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {adjustError}
          </p>
        ) : null}
        {adjustSuccess ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {adjustSuccess}
          </p>
        ) : null}
      </section>
    </div>
  );
}

'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchStoreOrderSettings,
  updateStoreOrderSettings,
  type StoreOrderSettings,
} from '@/lib/api/store-settings';
import { formatApiError } from '@/lib/api/error-message';

const DEFAULT_MINIMUM_ORDER_AMOUNT = 800;
const DEFAULT_FREE_DELIVERY_THRESHOLD = 2000;

export function StoreOrderSettingsForm() {
  const [settings, setSettings] = useState<StoreOrderSettings | null>(null);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(
    String(DEFAULT_MINIMUM_ORDER_AMOUNT),
  );
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    String(DEFAULT_FREE_DELIVERY_THRESHOLD),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStoreOrderSettings();
      setSettings(data);
      setMinimumOrderAmount(String(data.minimumOrderAmount));
      setFreeDeliveryThreshold(String(data.freeDeliveryThreshold));
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setToast(null);

    const minOrder = Number(minimumOrderAmount);
    const freeDelivery = Number(freeDeliveryThreshold);

    if (!Number.isFinite(minOrder) || minOrder < 0) {
      setError('Minimum order amount must be a valid number of 0 or greater.');
      setSaving(false);
      return;
    }
    if (!Number.isFinite(freeDelivery) || freeDelivery < 0) {
      setError('Free delivery threshold must be a valid number of 0 or greater.');
      setSaving(false);
      return;
    }

    try {
      const data = await updateStoreOrderSettings({
        minimumOrderAmount: minOrder,
        freeDeliveryThreshold: freeDelivery,
      });
      setSettings(data);
      setMinimumOrderAmount(String(data.minimumOrderAmount));
      setFreeDeliveryThreshold(String(data.freeDeliveryThreshold));
      setToast({ kind: 'success', message: 'Order settings saved.' });
    } catch (e) {
      const message = formatApiError(e);
      setError(message);
      setToast({ kind: 'error', message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-zinc-500">Loading order settings…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      {toast ? (
        <div
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-100'
              : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/90 dark:text-red-100'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Order settings
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Configure the minimum cart subtotal required to place an order, and the free-delivery
          threshold used at checkout. Shipping method fees are managed under Shipping.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Checkout thresholds
          </h2>

          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Minimum order amount</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={minimumOrderAmount}
              onChange={(e) => setMinimumOrderAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              required
            />
            <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
              Customers cannot start or place an order if the cart subtotal is below this amount
              (default {DEFAULT_MINIMUM_ORDER_AMOUNT}).
            </span>
          </label>

          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Free delivery threshold</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              required
            />
            <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
              When the cart subtotal reaches this amount, shipping becomes free at checkout
              (default {DEFAULT_FREE_DELIVERY_THRESHOLD}). Set to 0 to disable the automatic
              threshold (promotion-based free shipping still applies).
            </span>
          </label>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving} className={adminUi.btnPrimary}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          {settings?.updatedAt ? (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Last updated: {new Date(settings.updatedAt).toLocaleString()}
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}

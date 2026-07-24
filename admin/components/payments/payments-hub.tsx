'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchPendingCodPayments,
  fetchStorefrontPaymentMethods,
  collectCodPayment,
  failCodPayment,
  type PaymentRecord,
  type StorefrontPaymentMethod,
} from '@/lib/api/payments';
import { formatApiError } from '@/lib/api/error-message';
import { formatPrice } from '@/lib/currency';

export function PaymentsHub() {
  const [methods, setMethods] = useState<StorefrontPaymentMethod[]>([]);
  const [codRows, setCodRows] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codError, setCodError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setCodError(null);
    setLoading(true);
    try {
      const [m, c] = await Promise.all([
        fetchStorefrontPaymentMethods(),
        fetchPendingCodPayments(),
      ]);
      setMethods(m);
      setCodRows(c);
    } catch (e) {
      setError(formatApiError(e));
      setMethods([]);
      setCodRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCollect(paymentId: string) {
    if (!window.confirm('Mark this COD payment as collected (captured)?')) return;
    setCodError(null);
    setActionId(paymentId);
    try {
      await collectCodPayment(paymentId);
      await load();
    } catch (e) {
      setCodError(formatApiError(e));
    } finally {
      setActionId(null);
    }
  }

  async function onFail(paymentId: string) {
    const reason = window.prompt('Failure reason (optional, e.g. RTO):') ?? '';
    if (reason === null) return;
    if (!window.confirm('Mark this COD payment as failed?')) return;
    setCodError(null);
    setActionId(paymentId);
    try {
      await failCodPayment(paymentId, reason.trim() || undefined);
      await load();
    } catch (e) {
      setCodError(formatApiError(e));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Payments
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Storefront-active methods (read-only), COD collection queue, and links from{' '}
          <Link href="/orders" className="font-medium underline">
            orders
          </Link>
          .
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Active payment methods (checkout)
        </h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-mono">GET /payments/methods</span> — public-facing list; no credentials.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {loading ? (
            <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
          ) : methods.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">No active methods.</div>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Code</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Provider</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Flow</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">UI type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {methods.map((m) => (
                  <tr key={m.code} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-mono text-xs">{m.code}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {m.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{m.provider}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{m.flowType}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{m.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              COD — pending collection
            </h2>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-mono">GET /payments/cod/pending</span> · Only{' '}
              <span className="font-mono">pending</span> COD rows can be collected or failed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
          >
            Refresh
          </button>
        </div>
        {codError ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{codError}</p>
        ) : null}
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {loading ? (
            <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
          ) : codRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">No pending COD payments.</div>
          ) : (
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Payment</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Order</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Amount</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Created</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {codRows.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/payments/${p.id}`}
                        className="font-mono text-xs font-medium text-zinc-900 underline dark:text-zinc-100"
                      >
                        {p.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/orders/${p.orderId}`}
                        className="font-medium text-zinc-900 underline dark:text-zinc-100"
                      >
                        Order
                      </Link>
                      <div className="font-mono text-xs text-zinc-500">{p.orderId.slice(0, 8)}…</div>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium">
                      {formatPrice(p.amount, p.currency)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={actionId !== null}
                          onClick={() => void onCollect(p.id)}
                          className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-emerald-700"
                        >
                          Collect
                        </button>
                        <button
                          type="button"
                          disabled={actionId !== null}
                          onClick={() => void onFail(p.id)}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-800 disabled:opacity-50 dark:border-red-800 dark:text-red-300"
                        >
                          Fail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

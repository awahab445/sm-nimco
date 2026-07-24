'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchPaymentsByOrder,
  collectCodPayment,
  failCodPayment,
  type PaymentRecord,
} from '@/lib/api/payments';
import { formatApiError } from '@/lib/api/error-message';
import { formatPrice } from '@/lib/currency';

export function OrderPaymentsSection({ orderId }: { orderId: string }) {
  const [rows, setRows] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opsError, setOpsError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchPaymentsByOrder(orderId);
      setRows(list);
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCollect(paymentId: string) {
    if (!window.confirm('Mark this COD payment as collected?')) return;
    setOpsError(null);
    setActionId(paymentId);
    try {
      await collectCodPayment(paymentId);
      await load();
    } catch (e) {
      setOpsError(formatApiError(e));
    } finally {
      setActionId(null);
    }
  }

  async function onFail(paymentId: string) {
    const reason = window.prompt('Failure reason (optional):') ?? '';
    if (reason === null) return;
    if (!window.confirm('Mark this COD payment as failed?')) return;
    setOpsError(null);
    setActionId(paymentId);
    try {
      await failCodPayment(paymentId, reason.trim() || undefined);
      await load();
    } catch (e) {
      setOpsError(formatApiError(e));
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Payments</h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-mono">GET /payments/order/:orderId</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {opsError ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{opsError}</p>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading payments…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-zinc-500">No payments for this order.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Method</th>
                <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Amount</th>
                <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Created</th>
                <th className="px-3 py-2 text-right font-medium text-zinc-700 dark:text-zinc-300">
                  {' '}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((p) => {
                const codPending = p.paymentMethod.provider === 'cod' && p.status === 'pending';
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {p.paymentMethod.name}
                      </div>
                      <div className="text-xs text-zinc-500">{p.paymentMethod.provider}</div>
                    </td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2 tabular-nums">{formatPrice(p.amount, p.currency)}</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/payments/${p.id}`}
                          className="text-xs font-medium text-zinc-900 underline dark:text-zinc-100"
                        >
                          Detail
                        </Link>
                        {codPending ? (
                          <>
                            <button
                              type="button"
                              disabled={actionId !== null}
                              onClick={() => void onCollect(p.id)}
                              className="text-xs font-medium text-emerald-800 underline disabled:opacity-50 dark:text-emerald-300"
                            >
                              Collect
                            </button>
                            <button
                              type="button"
                              disabled={actionId !== null}
                              onClick={() => void onFail(p.id)}
                              className="text-xs font-medium text-red-700 underline disabled:opacity-50 dark:text-red-400"
                            >
                              Fail
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

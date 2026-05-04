'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPayment, type PaymentRecord } from '@/lib/api/payments';
import { formatApiError } from '@/lib/api/error-message';

function money(amount: string | number, currency: string) {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(n)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export function PaymentDetailView({ paymentId }: { paymentId: string }) {
  const [row, setRow] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const p = await fetchPayment(paymentId);
      setRow(p);
    } catch (e) {
      setError(formatApiError(e));
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (error || !row) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error ?? 'Not found.'}
      </p>
    );
  }

  const isCod = row.paymentMethod.provider === 'cod';
  const canCodOps = isCod && row.status === 'pending';

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/payments"
        className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
      >
        ← Payments
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Payment {row.id.slice(0, 8)}…
      </h1>
      <p className="mt-1 font-mono text-xs text-zinc-500">{row.id}</p>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Status</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">{row.status}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Amount</dt>
            <dd className="font-medium tabular-nums">{money(row.amount, row.currency)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Order</dt>
            <dd>
              <Link
                href={`/orders/${row.orderId}`}
                className="font-medium text-zinc-900 underline dark:text-zinc-100"
              >
                Open order
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Method</dt>
            <dd>
              {row.paymentMethod.name}{' '}
              <span className="text-zinc-500">({row.paymentMethod.provider})</span>
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Flow</dt>
            <dd>{row.flowType}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Gateway txn</dt>
            <dd className="font-mono text-xs break-all">{row.gatewayTransactionId ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Captured</dt>
            <dd>{row.capturedAt ? new Date(row.capturedAt).toLocaleString() : '—'}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Failed</dt>
            <dd>{row.failedAt ? new Date(row.failedAt).toLocaleString() : '—'}</dd>
          </div>
        </dl>
        {canCodOps ? (
          <p className="mt-4 text-xs text-amber-800 dark:text-amber-200">
            Use <strong>Collect</strong> / <strong>Fail</strong> on the{' '}
            <Link href="/payments" className="underline">
              payments
            </Link>{' '}
            COD queue for consistent confirmations.
          </p>
        ) : null}
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Raw record</h2>
        <pre className="mt-2 max-h-[480px] overflow-auto rounded-lg bg-zinc-50 p-3 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          {JSON.stringify(
            {
              ...row,
              clientSecret: row.clientSecret ? '[redacted]' : null,
            },
            null,
            2,
          )}
        </pre>
      </section>
    </div>
  );
}

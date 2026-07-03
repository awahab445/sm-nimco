'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchAdminOrder,
  updateAdminOrderStatus,
  type FulfillmentStatus,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/api/orders';
import { formatApiError } from '@/lib/api/error-message';
import { OrderPaymentsSection } from '@/components/payments/order-payments-section';

function money(amount: string | number, currency: string) {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(n)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

function formatAddress(a: Record<string, unknown> | null | undefined): string {
  if (!a || typeof a !== 'object') return '—';
  const get = (k: string) => (typeof a[k] === 'string' ? (a[k] as string) : '');
  const lines: string[] = [];
  const name = [get('firstName'), get('lastName')].filter(Boolean).join(' ');
  if (name) lines.push(name);
  const company = get('company');
  if (company) lines.push(company);
  const line1 = get('addressLine1');
  if (line1) lines.push(line1);
  const line2 = get('addressLine2');
  if (line2) lines.push(line2);
  const cityLine = [get('city'), get('state'), get('postalCode')].filter(Boolean).join(', ');
  if (cityLine) lines.push(cityLine);
  const country = get('country');
  if (country) lines.push(country);
  const phone = get('phone');
  if (phone) lines.push(`Phone: ${phone}`);
  return lines.length ? lines.join('\n') : '—';
}

export function OrderDetailView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<OrderStatus>('pending');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [fulfillmentStatus, setFulfillmentStatus] =
    useState<FulfillmentStatus>('unfulfilled');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const o = await fetchAdminOrder(orderId);
      setOrder(o);
      setStatus(o.status);
      setPaymentStatus((o.paymentStatus ?? 'pending') as PaymentStatus);
      setFulfillmentStatus((o.fulfillmentStatus ?? 'unfulfilled') as FulfillmentStatus);
    } catch (e) {
      setError(formatApiError(e));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStatusSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!order) return;

    const paymentPayload =
      paymentStatus === (order.paymentStatus ?? 'pending') ? undefined : paymentStatus;
    const fulfillmentPayload =
      fulfillmentStatus === (order.fulfillmentStatus ?? 'unfulfilled')
        ? undefined
        : fulfillmentStatus;

    const changed =
      status !== order.status ||
      paymentPayload !== undefined ||
      fulfillmentPayload !== undefined;

    if (!changed) {
      setFormError('No changes to save.');
      return;
    }

    const msg = `Update order ${order.orderNumber}?\n\nOrder: ${status}\nPayment: ${paymentStatus}\nFulfillment: ${fulfillmentStatus}`;
    if (!window.confirm(msg)) return;

    setSaving(true);
    try {
      const updated = await updateAdminOrderStatus(orderId, {
        status,
        ...(paymentPayload !== undefined ? { paymentStatus: paymentPayload } : {}),
        ...(fulfillmentPayload !== undefined ? { fulfillmentStatus: fulfillmentPayload } : {}),
      });
      setOrder(updated);
      setStatus(updated.status);
      setPaymentStatus((updated.paymentStatus ?? 'pending') as PaymentStatus);
      setFulfillmentStatus((updated.fulfillmentStatus ?? 'unfulfilled') as FulfillmentStatus);
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading order…</p>;
  }

  if (error || !order) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error ?? 'Order not found.'}
      </p>
    );
  }

  const billing = order.billingAddress as unknown as Record<string, unknown>;
  const shipping = order.shippingAddress as unknown as Record<string, unknown>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/orders"
            className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
          >
            ← Orders
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Placed {new Date(order.createdAt).toLocaleString()} · {order.currency}
          </p>
        </div>
        {order.customerId ? (
          <Link
            href={`/customers/${order.customerId}`}
            className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium dark:border-zinc-600"
          >
            View customer
          </Link>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Billing</h2>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-zinc-700 dark:text-zinc-300">
            {formatAddress(billing)}
          </pre>
        </section>
        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Shipping</h2>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-zinc-700 dark:text-zinc-300">
            {formatAddress(shipping)}
          </pre>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Line items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">SKU</th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  Qty
                </th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  Unit
                </th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  Row
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {item.sku}
                  </td>
                  <td className="px-4 py-2 text-zinc-800 dark:text-zinc-200">{item.name}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{item.quantity}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {money(item.unitPrice, order.currency)}
                  </td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                    {money(item.rowTotal, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Totals</h2>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600 dark:text-zinc-400">Subtotal</dt>
            <dd className="tabular-nums text-zinc-900 dark:text-zinc-50">
              {money(order.subtotal, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600 dark:text-zinc-400">Discount</dt>
            <dd className="tabular-nums text-zinc-900 dark:text-zinc-50">
              {money(order.discountTotal, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600 dark:text-zinc-400">Shipping</dt>
            <dd className="tabular-nums text-zinc-900 dark:text-zinc-50">
              {money(order.shippingTotal, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600 dark:text-zinc-400">Tax</dt>
            <dd className="tabular-nums text-zinc-900 dark:text-zinc-50">
              {money(order.taxTotal, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-zinc-200 pt-2 dark:border-zinc-800">
            <dt className="font-medium text-zinc-900 dark:text-zinc-50">Grand total</dt>
            <dd className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {money(order.grandTotal, order.currency)}
            </dd>
          </div>
        </dl>
      </section>

      <OrderPaymentsSection orderId={orderId} />

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Update status</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Changes call <span className="font-mono">PUT /admin/orders/:id/status</span>. Confirm
          before saving.
        </p>
        <form onSubmit={handleStatusSubmit} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Order status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Payment status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Fulfillment
              </label>
              <select
                value={fulfillmentStatus}
                onChange={(e) => setFulfillmentStatus(e.target.value as FulfillmentStatus)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="unfulfilled">Unfulfilled</option>
                <option value="partially_fulfilled">Partially fulfilled</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className={adminUi.btnPrimary}
            >
              {saving ? 'Saving…' : 'Save status'}
            </button>
            <button
              type="button"
              onClick={() => void load()}
              disabled={saving}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
            >
              Reload
            </button>
          </div>
        </form>
      </section>

      {order.notes ? (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {order.notes}
          </p>
        </section>
      ) : null}
    </div>
  );
}

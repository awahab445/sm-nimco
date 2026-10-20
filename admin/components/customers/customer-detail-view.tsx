'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCustomerGroups, type CustomerGroup } from '@/lib/api/customer-groups';
import {
  deleteAdminCustomer,
  fetchAdminCustomer,
  updateAdminCustomer,
  type Customer,
} from '@/lib/api/customers';
import {
  fetchAdminOrders,
  orderStatusLabel,
  paymentStatusLabel,
  type Order,
} from '@/lib/api/orders';
import { formatApiError } from '@/lib/api/error-message';
import { formatPrice } from '@/lib/currency';

function parseMetadataJson(raw: string): Record<string, unknown> {
  const t = raw.trim();
  if (!t) return {};
  const parsed = JSON.parse(t) as unknown;
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Metadata must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

type CustomerTier = 'New' | 'Returning' | 'VIP';

const VIP_SPEND_THRESHOLD = 50_000;
const VIP_ORDER_THRESHOLD = 5;

function resolveCustomerTier(
  orderCount: number,
  lifetimeSpent: number,
): CustomerTier {
  if (lifetimeSpent >= VIP_SPEND_THRESHOLD || orderCount >= VIP_ORDER_THRESHOLD) {
    return 'VIP';
  }
  if (orderCount >= 2) return 'Returning';
  return 'New';
}

function tierClasses(tier: CustomerTier): string {
  if (tier === 'VIP') {
    return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
  }
  if (tier === 'Returning') {
    return 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200';
  }
  return 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200';
}

function statusPill(label: string, tone: 'neutral' | 'success' | 'warning' | 'danger') {
  const tones = {
    neutral: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
    success: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
    danger: 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200',
  } as const;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {label}
    </span>
  );
}

function orderStatusTone(s: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (s === 'completed') return 'success';
  if (s === 'cancelled') return 'danger';
  if (s === 'processing' || s === 'ready_for_pickup') return 'warning';
  return 'neutral';
}

export function CustomerDetailView({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [customerGroupId, setCustomerGroupId] = useState('');
  const [metadataJson, setMetadataJson] = useState('{}');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const c = await fetchAdminCustomer(customerId);
      setCustomer(c);
      setEmail(c.email);
      setFirstName(c.firstName ?? '');
      setLastName(c.lastName ?? '');
      setPhone(c.phone ?? '');
      setIsGuest(c.isGuest);
      setCustomerGroupId(c.customerGroupId);
      setMetadataJson(JSON.stringify(c.metadata ?? {}, null, 2));
    } catch (e) {
      setError(formatApiError(e));
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetchAdminOrders({
        customerId,
        limit: 100,
        page: 1,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setOrders(res.data);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    void fetchCustomerGroups().then(setGroups).catch(() => setGroups([]));
  }, []);

  const ltv = useMemo(() => {
    const counted = orders.filter((o) => o.status !== 'cancelled');
    const lifetimeSpent = counted.reduce(
      (sum, o) => sum + Number(o.grandTotal || 0),
      0,
    );
    const totalOrders = counted.length;
    const aov = totalOrders > 0 ? lifetimeSpent / totalOrders : 0;
    const tier = resolveCustomerTier(totalOrders, lifetimeSpent);
    return { lifetimeSpent, totalOrders, aov, tier };
  }, [orders]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!customerGroupId) {
      setFormError('Customer group is required');
      return;
    }
    let metadata: Record<string, unknown>;
    try {
      metadata = parseMetadataJson(metadataJson);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Invalid metadata');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateAdminCustomer(customerId, {
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        isGuest,
        customerGroupId,
        metadata,
      });
      setCustomer(updated);
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!customer) return;
    if (!window.confirm(`Delete customer ${customer.email}? This cannot be undone.`)) return;
    setDeleteError(null);
    try {
      await deleteAdminCustomer(customer.id);
      router.push('/customers');
    } catch (err) {
      setDeleteError(formatApiError(err));
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading customer…</p>;
  }

  if (error || !customer) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error ?? 'Not found.'}{' '}
        <Link href="/customers" className="underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/customers" className="text-sm text-zinc-600 underline dark:text-zinc-400">
        ← Customers
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {[customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
                customer.email}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tierClasses(ltv.tier)}`}
            >
              {ltv.tier}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-500">{customer.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/orders?customerId=${customer.id}`}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-600"
          >
            View orders
          </Link>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 dark:border-red-800 dark:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      {deleteError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {deleteError}
        </p>
      ) : null}

      <section className="mt-6" aria-labelledby="ltv-heading">
        <h2
          id="ltv-heading"
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Lifetime value
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Lifetime Spent"
            value={formatPrice(ltv.lifetimeSpent)}
            mono
            loading={ordersLoading}
          />
          <MetricCard
            label="Total Orders"
            value={String(ltv.totalOrders)}
            loading={ordersLoading}
          />
          <MetricCard
            label="Average Order Value"
            value={formatPrice(ltv.aov)}
            mono
            loading={ordersLoading}
          />
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Customer Tier
            </p>
            {ordersLoading ? (
              <div className="mt-3 h-7 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${tierClasses(ltv.tier)}`}
              >
                {ltv.tier}
              </span>
            )}
            <p className="mt-2 text-xs text-zinc-500">
              VIP: Rs. {VIP_SPEND_THRESHOLD.toLocaleString('en-PK')}+ or{' '}
              {VIP_ORDER_THRESHOLD}+ orders
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="order-history-heading">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="order-history-heading"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Order history
          </h2>
          <Link href={`/orders?customerId=${customer.id}`} className={adminUi.link}>
            Open in Orders
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Order
                </th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Payment
                </th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  Total
                </th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Placed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {ordersLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    Loading orders…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/orders/${o.id}`}
                        className={`font-mono text-xs tracking-tight ${adminUi.link}`}
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {statusPill(orderStatusLabel(o.status), orderStatusTone(o.status))}
                    </td>
                    <td className="px-4 py-3">
                      {statusPill(
                        paymentStatusLabel(o.paymentStatus),
                        o.paymentStatus === 'paid'
                          ? 'success'
                          : o.paymentStatus === 'failed'
                            ? 'danger'
                            : 'neutral',
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm tabular-nums">
                      {formatPrice(o.grandTotal, o.currency)}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <form
        onSubmit={(e) => void handleSave(e)}
        className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
      >
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Edit profile
        </h2>

        {formError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {formError}
          </p>
        ) : null}

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              First name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Last name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Phone
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={isGuest}
            onChange={(e) => setIsGuest(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Guest account
        </label>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Customer group *
          </label>
          <select
            value={customerGroupId}
            onChange={(e) => setCustomerGroupId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          >
            {customerGroupId && !groups.some((g) => g.id === customerGroupId) ? (
              <option value={customerGroupId}>
                {customer.customerGroup?.name ?? 'Current group'}
              </option>
            ) : null}
            {groups
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                  {g.isDefault ? ' (default)' : ''}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Metadata (JSON)
          </label>
          <textarea
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>

        <button type="submit" disabled={saving} className={adminUi.btnPrimary}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

function MetricCard({
  label,
  value,
  mono,
  loading,
}: {
  label: string;
  value: string;
  mono?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      {loading ? (
        <div className="mt-3 h-7 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      ) : (
        <p
          className={`mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50 ${
            mono ? 'font-mono tracking-tight' : ''
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

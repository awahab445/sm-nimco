'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminUi } from '@/lib/admin-ui';
import { useAuthStore } from '@/lib/auth.store';
import { usePermissions } from '@/lib/use-permissions';
import {
  fetchDashboardStats,
  type DashboardStats,
} from '@/lib/api/dashboard';
import { formatApiError } from '@/lib/api/error-message';
import { formatPrice } from '@/lib/currency';
import { orderStatusLabel } from '@/lib/api/orders';

function statusTone(s: string): string {
  if (s === 'completed') {
    return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200';
  }
  if (s === 'cancelled') {
    return 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200';
  }
  if (s === 'processing' || s === 'ready_for_pickup') {
    return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
  }
  return 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200';
}

function KpiSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 h-7 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const { ready, can } = usePermissions();
  const canReadReports = can('reports', 'read');

  const displayName =
    user?.firstName || user?.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : null;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canReadReports) return;
    setLoading(true);
    setError(null);
    try {
      setStats(await fetchDashboardStats());
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [canReadReports]);

  useEffect(() => {
    if (!ready || !canReadReports) return;
    void load();
  }, [ready, canReadReports, load]);

  const kpiCards = stats
    ? [
        {
          label: 'Total Sales',
          value: formatPrice(stats.totalRevenue),
          hint:
            stats.pendingRevenue > 0
              ? `Pending: ${formatPrice(stats.pendingRevenue)}`
              : undefined,
        },
        {
          label: 'Orders',
          value: String(stats.totalOrders),
          hint: undefined,
        },
        {
          label: 'AOV',
          value: formatPrice(stats.averageOrderValue),
          hint: 'Average order value',
        },
        {
          label: 'Customers',
          value: String(stats.totalCustomers),
          hint:
            stats.lowStockCount > 0
              ? `${stats.lowStockCount} low-stock SKU(s)`
              : 'Inventory healthy',
        },
      ]
    : [];

  const statusCards = stats
    ? [
        { label: 'Pending', value: stats.pendingCount },
        { label: 'Processing', value: stats.processingCount },
        { label: 'Shipped', value: stats.shippedCount },
        { label: 'Completed', value: stats.completedCount },
        { label: 'Cancelled', value: stats.cancelledCount },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {displayName ? `Welcome back, ${displayName}` : 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Live commerce KPIs for the store. Refresh anytime for the latest figures.
          </p>
        </div>
        {canReadReports ? (
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={adminUi.btnSecondary}
          >
            {loading ? 'Refreshing…' : 'Refresh Data'}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {!canReadReports && ready ? (
        <p className="mt-6 text-sm text-zinc-500">
          KPI cards require <span className="font-mono text-xs">reports.read</span>.
          Use the sidebar to open modules you can access.
        </p>
      ) : null}

      {canReadReports ? (
        <>
          <section className="mt-8" aria-labelledby="kpi-heading">
            <h2
              id="kpi-heading"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Key metrics
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {loading && !stats
                ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
                : kpiCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {card.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                        {card.value}
                      </p>
                      {card.hint ? (
                        <p className="mt-1 text-xs text-zinc-500">{card.hint}</p>
                      ) : null}
                    </div>
                  ))}
            </div>
          </section>

          <section className="mt-8" aria-labelledby="status-heading">
            <h2
              id="status-heading"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Orders by status
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {loading && !stats
                ? Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
                : statusCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {card.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                        {card.value}
                      </p>
                    </div>
                  ))}
            </div>
          </section>

          <section className="mt-8" aria-labelledby="recent-heading">
            <div className="flex items-center justify-between gap-3">
              <h2
                id="recent-heading"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Recent orders
              </h2>
              <Link href="/orders" className={adminUi.link}>
                View all
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
                      Customer
                    </th>
                    <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Total
                    </th>
                    <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Status
                    </th>
                    <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Placed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loading && !stats ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        Loading recent orders…
                      </td>
                    </tr>
                  ) : !stats?.recentOrders.length ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    stats.recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/orders/${o.id}`}
                            className={`font-mono text-xs ${adminUi.link}`}
                          >
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-900 dark:text-zinc-50">
                            {o.customerName}
                          </div>
                          <div className="text-xs text-zinc-500">{o.customerEmail}</div>
                        </td>
                        <td className="px-4 py-3 tabular-nums font-medium">
                          {formatPrice(o.grandTotal, o.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(o.status)}`}
                          >
                            {orderStatusLabel(o.status)}
                          </span>
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
        </>
      ) : null}

      <section className="mt-10" aria-labelledby="quick-links-heading">
        <h2
          id="quick-links-heading"
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Quick links
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: '/orders', title: 'Orders', description: 'Fulfillment queue' },
            { href: '/reports', title: 'Reports', description: 'Summary & CSV export' },
            { href: '/inventory', title: 'Inventory', description: 'Stock levels' },
            { href: '/products', title: 'Products', description: 'Catalog' },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </span>
                <span className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

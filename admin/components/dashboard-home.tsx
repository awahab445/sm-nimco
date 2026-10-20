'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminUi } from '@/lib/admin-ui';
import { useAuthStore } from '@/lib/auth.store';
import { usePermissions } from '@/lib/use-permissions';
import {
  fetchCourierPerformance,
  fetchDashboardStats,
  fetchSalesTrends,
  fetchTopSellingProducts,
  type CourierPerformance,
  type DashboardStats,
  type SalesTrendPeriod,
  type SalesTrends,
  type TopSellingProduct,
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

const PERIOD_OPTIONS: Array<{ value: SalesTrendPeriod; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const { ready, can } = usePermissions();
  const canReadReports = can('reports', 'read');

  const displayName =
    user?.firstName || user?.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : null;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<SalesTrends | null>(null);
  const [courier, setCourier] = useState<CourierPerformance | null>(null);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [period, setPeriod] = useState<SalesTrendPeriod>('daily');
  const [loading, setLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCore = useCallback(async () => {
    if (!canReadReports) return;
    setLoading(true);
    setError(null);
    try {
      const [s, c, t] = await Promise.all([
        fetchDashboardStats(),
        fetchCourierPerformance(),
        fetchTopSellingProducts(5),
      ]);
      setStats(s);
      setCourier(c);
      setTopProducts(t);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [canReadReports]);

  const loadTrends = useCallback(async () => {
    if (!canReadReports) return;
    setTrendsLoading(true);
    try {
      setTrends(await fetchSalesTrends(period));
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setTrendsLoading(false);
    }
  }, [canReadReports, period]);

  useEffect(() => {
    if (!ready || !canReadReports) return;
    void loadCore();
  }, [ready, canReadReports, loadCore]);

  useEffect(() => {
    if (!ready || !canReadReports) return;
    void loadTrends();
  }, [ready, canReadReports, loadTrends]);

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

  const courierChartData = useMemo(() => {
    if (!courier) return [];
    return [
      { name: 'Delivered', rate: courier.deliveredRate, count: courier.delivered },
      { name: 'In-Transit', rate: courier.inTransitRate, count: courier.inTransit },
      { name: 'RTO', rate: courier.rtoRate, count: courier.rto },
      { name: 'Pending', rate: courier.pendingRate, count: courier.pending },
    ];
  }, [courier]);

  const refreshAll = async () => {
    await Promise.all([loadCore(), loadTrends()]);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {displayName ? `Welcome back, ${displayName}` : 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Live commerce KPIs, trends, and courier performance.
          </p>
        </div>
        {canReadReports ? (
          <button
            type="button"
            onClick={() => void refreshAll()}
            disabled={loading || trendsLoading}
            className={adminUi.btnSecondary}
          >
            {loading || trendsLoading ? 'Refreshing…' : 'Refresh Data'}
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

          <section className="mt-8" aria-labelledby="sales-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2
                id="sales-heading"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Sales & revenue
              </h2>
              <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-950">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPeriod(opt.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      period === opt.value
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              {trendsLoading && !trends ? (
                <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                  Loading chart…
                </div>
              ) : !trends?.points.length ? (
                <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                  No sales data for this period.
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends.points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={56} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={40} />
                      <Tooltip
                        formatter={(value, name) => {
                          const n = typeof value === 'number' ? value : Number(value);
                          if (name === 'revenue' || name === 'averageOrderValue') {
                            return [formatPrice(n), name === 'revenue' ? 'Revenue' : 'AOV'];
                          }
                          return [n, 'Orders'];
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#4F90F1"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orderCount"
                        name="Orders"
                        stroke="#3577D9"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="averageOrderValue"
                        name="AOV"
                        stroke="#94a3b8"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section aria-labelledby="courier-heading">
              <h2
                id="courier-heading"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Courier performance — Leopards
              </h2>
              <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                {loading && !courier ? (
                  <div className="flex h-56 items-center justify-center text-sm text-zinc-500">
                    Loading…
                  </div>
                ) : !courier || courier.total === 0 ? (
                  <div className="flex h-56 items-center justify-center text-sm text-zinc-500">
                    No Leopards shipments yet.
                  </div>
                ) : (
                  <>
                    <p className="mb-2 text-xs text-zinc-500">
                      {courier.total} shipment{courier.total === 1 ? '' : 's'} tracked
                    </p>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courierChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            unit="%"
                            domain={[0, 100]}
                            width={40}
                          />
                          <Tooltip
                            formatter={(value, _name, item) => {
                              const rate =
                                typeof value === 'number' ? value : Number(value);
                              const count =
                                item?.payload &&
                                typeof item.payload === 'object' &&
                                'count' in item.payload
                                  ? Number(
                                      (item.payload as { count: number }).count,
                                    )
                                  : 0;
                              return [`${rate}% (${count})`, 'Rate'];
                            }}
                          />
                          <Bar dataKey="rate" name="Rate %" fill="#4F90F1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section aria-labelledby="top-products-heading">
              <h2
                id="top-products-heading"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Top selling products
              </h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                {loading && topProducts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
                ) : topProducts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-zinc-500">
                    No product sales yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {topProducts.map((p, idx) => (
                      <li
                        key={`${p.productId}-${p.sku}`}
                        className="flex items-start justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-zinc-400">
                              #{idx + 1}
                            </span>
                            <Link
                              href={`/products/${p.productId}`}
                              className={`truncate text-sm font-medium ${adminUi.link}`}
                            >
                              {p.name}
                            </Link>
                            {p.isLowStock ? (
                              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                                Low Stock
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 font-mono text-xs text-zinc-500">
                            {p.sku} · stock {p.availableQuantity}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                            {formatPrice(p.revenue)}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {p.unitsSold} unit{p.unitsSold === 1 ? '' : 's'}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

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

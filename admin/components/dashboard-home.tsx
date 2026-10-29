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
import { adminUi, chartColors } from '@/lib/admin-ui';
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
import {
  orderStatusTone,
  statusPillClass,
} from '@/lib/status-tones';

function KpiSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="h-3 w-20 rounded bg-muted" />
      <div className="mt-3 h-7 w-28 rounded bg-muted" />
    </div>
  );
}

const KPI_ICONS: Record<string, string> = {
  'Total Sales': '₨',
  Orders: '#',
  AOV: '⌀',
  Customers: '◎',
};

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
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
            SM Nimco &amp; Sweets
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {displayName ? `Welcome back, ${displayName}` : 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
            <div className="flex items-center gap-2">
              <h2
                id="kpi-heading"
                className="text-sm font-semibold text-foreground"
              >
                Key metrics
              </h2>
              <span className="rounded-full bg-brand-gradient px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
                Live
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {loading && !stats
                ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
                : kpiCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-border bg-card p-4 shadow-sm ring-1 ring-brand/5 bg-brand-gradient-soft/40 transition hover:shadow-brand-glow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {card.label}
                        </p>
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-xs font-bold text-white shadow-sm"
                          aria-hidden
                        >
                          {KPI_ICONS[card.label] ?? '•'}
                        </span>
                      </div>
                      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">
                        {card.value}
                      </p>
                      {card.hint ? (
                        <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
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
              <div className="inline-flex rounded-lg border border-border bg-card p-0.5 shadow-sm">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPeriod(opt.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      period === opt.value
                        ? 'bg-brand-gradient text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              {trendsLoading && !trends ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  Loading chart…
                </div>
              ) : !trends?.points.length ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No sales data for this period.
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends.points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="nimcoRevenue" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={chartColors.primary} />
                          <stop offset="100%" stopColor={chartColors.secondary} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
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
                        stroke="url(#nimcoRevenue)"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orderCount"
                        name="Orders"
                        stroke={chartColors.terracotta}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="averageOrderValue"
                        name="AOV"
                        stroke={chartColors.muted}
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
              <div className="mt-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                {loading && !courier ? (
                  <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                    Loading…
                  </div>
                ) : !courier || courier.total === 0 ? (
                  <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                    No Leopards shipments yet.
                  </div>
                ) : (
                  <>
                    <p className="mb-2 text-xs text-muted-foreground">
                      {courier.total} shipment{courier.total === 1 ? '' : 's'} tracked
                    </p>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courierChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="nimcoBar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={chartColors.primaryBright} />
                              <stop offset="100%" stopColor={chartColors.secondary} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
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
                          <Bar dataKey="rate" name="Rate %" fill="url(#nimcoBar)" radius={[6, 6, 0, 0]} />
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
              <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                {loading && topProducts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
                ) : topProducts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No product sales yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {topProducts.map((p, idx) => (
                      <li
                        key={`${p.productId}-${p.sku}`}
                        className={`flex items-start justify-between gap-3 px-4 py-3 ${adminUi.tableRow}`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              #{idx + 1}
                            </span>
                            <Link
                              href={`/products/${p.productId}`}
                              className={`truncate text-sm font-medium ${adminUi.link}`}
                            >
                              {p.name}
                            </Link>
                            {p.isLowStock ? (
                              <span className={statusPillClass('pending')}>
                                Low Stock
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                            {p.sku} · stock {p.availableQuantity}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-sm font-medium tabular-nums text-foreground">
                            {formatPrice(p.revenue)}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                      className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm ring-1 ring-brand/5"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {card.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
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
            <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className={adminUi.tableHead}>
                  <tr>
                    <th className={adminUi.tableHeadCell}>Order</th>
                    <th className={adminUi.tableHeadCell}>Customer</th>
                    <th className={adminUi.tableHeadCell}>Total</th>
                    <th className={adminUi.tableHeadCell}>Status</th>
                    <th className={adminUi.tableHeadCell}>Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading && !stats ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Loading recent orders…
                      </td>
                    </tr>
                  ) : !stats?.recentOrders.length ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    stats.recentOrders.map((o) => (
                      <tr key={o.id} className={adminUi.tableRow}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/orders/${o.id}`}
                            className={`font-mono text-xs ${adminUi.link}`}
                          >
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">
                            {o.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                        </td>
                        <td className="px-4 py-3 tabular-nums font-medium">
                          {formatPrice(o.grandTotal, o.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={statusPillClass(orderStatusTone(o.status))}>
                            {orderStatusLabel(o.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
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
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-brand/30 hover:shadow-brand-glow"
              >
                <span className="font-medium text-foreground">
                  {item.title}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
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

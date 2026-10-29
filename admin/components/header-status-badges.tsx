'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { fetchDashboardStats } from '@/lib/api/dashboard';
import { usePermissions } from '@/lib/use-permissions';

const POLL_MS = 60_000;

type Snapshot = {
  todayOrders: number;
  pendingDispatches: number;
};

export function HeaderStatusBadges() {
  const { ready, can } = usePermissions();
  const canRead = ready && can('reports', 'read');
  const { resolvedTheme } = useTheme();
  const [snap, setSnap] = useState<Snapshot | null>(null);

  const load = useCallback(async () => {
    if (!canRead) return;
    try {
      const stats = await fetchDashboardStats();
      setSnap({
        todayOrders: stats.totalOrders,
        pendingDispatches: stats.pendingCount + stats.processingCount,
      });
    } catch {
      /* keep last good snapshot */
    }
  }, [canRead]);

  useEffect(() => {
    if (!canRead) return;
    const kickoff = window.setTimeout(() => void load(), 0);
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(id);
    };
  }, [canRead, load]);

  const themeLabel =
    resolvedTheme === 'dark'
      ? 'Dark'
      : resolvedTheme === 'light'
        ? 'Light'
        : 'System';

  return (
    <div className="hidden items-center gap-1.5 lg:flex">
      {canRead && snap ? (
        <>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-brand-gradient-soft px-2.5 py-1 text-[11px] font-semibold text-stone-800 shadow-sm transition hover:shadow-brand-glow dark:text-amber-100"
            title="Total orders (all-time KPI)"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
            Today&apos;s Orders
            <span className="tabular-nums text-brand dark:text-amber-300">
              {snap.todayOrders}
            </span>
          </Link>
          <Link
            href="/orders?status=pending"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-sm transition hover:border-brand/30 hover:bg-brand-soft dark:text-stone-200"
            title="Pending + processing dispatches"
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-secondary"
              aria-hidden
            />
            Pending Dispatches
            <span className="tabular-nums text-brand-secondary dark:text-orange-300">
              {snap.pendingDispatches}
            </span>
          </Link>
        </>
      ) : null}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
        Theme
        <span className="text-foreground">{themeLabel}</span>
      </span>
    </div>
  );
}

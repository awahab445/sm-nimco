'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDashboardStats } from '@/lib/api/dashboard';
import { usePermissions } from '@/lib/use-permissions';

const POLL_MS = 60_000;

type AlertSnapshot = {
  lowStockCount: number;
  pendingCount: number;
  rtoCount: number;
  updatedAt: number;
};

export function NotificationBell() {
  const { ready, can } = usePermissions();
  const canRead = ready && can('reports', 'read');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertSnapshot | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const loadAlerts = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    setError(null);
    try {
      const stats = await fetchDashboardStats();
      setAlerts({
        lowStockCount: stats.lowStockCount ?? 0,
        pendingCount: stats.pendingCount ?? 0,
        rtoCount: stats.rtoCount ?? 0,
        updatedAt: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [canRead]);

  useEffect(() => {
    if (!canRead) return;
    // Defer so the effect stays a subscription (poll) rather than sync setState.
    const kickoff = window.setTimeout(() => void loadAlerts(), 0);
    const id = window.setInterval(() => void loadAlerts(), POLL_MS);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(id);
    };
  }, [canRead, loadAlerts]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!canRead) return null;

  const badgeCount =
    (alerts?.lowStockCount ?? 0) +
    (alerts?.pendingCount ?? 0) +
    (alerts?.rtoCount ?? 0);
  const hasAlerts = badgeCount > 0;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) void loadAlerts();
        }}
        className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        aria-label={
          hasAlerts
            ? `Notifications, ${badgeCount} alerts`
            : 'Notifications'
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <BellIcon className="h-4 w-4" />
        {hasAlerts ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Activity alerts
            </p>
            <button
              type="button"
              onClick={() => void loadAlerts()}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {error ? (
            <p className="px-3 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
              <AlertRow
                href="/inventory"
                title="Low stock"
                description="SKUs at or below threshold"
                count={alerts?.lowStockCount ?? 0}
                tone="amber"
                onNavigate={() => setOpen(false)}
              />
              <AlertRow
                href="/orders?status=pending"
                title="Pending orders"
                description="Awaiting processing"
                count={alerts?.pendingCount ?? 0}
                tone="blue"
                onNavigate={() => setOpen(false)}
              />
              <AlertRow
                href="/shipping"
                title="RTO / delivery failures"
                description="Courier returned or cancelled"
                count={alerts?.rtoCount ?? 0}
                tone="red"
                onNavigate={() => setOpen(false)}
              />
            </ul>
          )}

          <div className="border-t border-zinc-200 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            Updates every 60 seconds
            {alerts?.updatedAt
              ? ` · ${new Date(alerts.updatedAt).toLocaleTimeString()}`
              : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AlertRow({
  href,
  title,
  description,
  count,
  tone,
  onNavigate,
}: {
  href: string;
  title: string;
  description: string;
  count: number;
  tone: 'amber' | 'blue' | 'red';
  onNavigate: () => void;
}) {
  const toneClass =
    tone === 'amber'
      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
      : tone === 'red'
        ? 'bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-200'
        : 'bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200';

  return (
    <li>
      <Link
        href={href}
        role="menuitem"
        onClick={onNavigate}
        className="flex items-start gap-3 px-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <span
          className={`mt-0.5 inline-flex min-w-7 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${toneClass}`}
        >
          {count}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {title}
          </span>
          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </span>
        </span>
      </Link>
    </li>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

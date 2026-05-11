'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNavGroups, isNavActive } from '@/lib/navigation';
import { usePermissions } from '@/lib/use-permissions';

type AppSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

const appName =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ADMIN_APP_NAME
    ? process.env.NEXT_PUBLIC_ADMIN_APP_NAME
    : 'Commerce Admin';

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname() ?? '';
  const { ready, canAny } = usePermissions();

  useEffect(() => {
    if (mobileOpen) {
      onMobileClose();
    }
  }, [pathname, mobileOpen, onMobileClose]);

  /**
   * Hide nav items whose `requirePermission` is not satisfied. While the auth
   * check is still in flight (`ready === false`), show items that have no
   * permission requirement so the dashboard link doesn't flicker, but withhold
   * gated items until we know what the user can do.
   */
  const visibleGroups = useMemo(() => {
    return adminNavGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!item.requirePermission || item.requirePermission.length === 0) return true;
          if (!ready) return false;
          return canAny(item.requirePermission);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [ready, canAny]);

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-[1px] transition-opacity md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onMobileClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-950 md:static md:z-0 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0 md:shadow-none'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {appName}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Operations</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main">
          {visibleGroups.map((group) => (
            <div key={group.title} className="mb-4 last:mb-0">
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block rounded-lg px-2.5 py-2 text-sm transition-colors ${
                          active
                            ? 'bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900'
                            : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
                        }`}
                        title={item.description}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

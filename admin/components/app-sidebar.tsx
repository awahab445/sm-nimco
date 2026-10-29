'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
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
    : 'SM Nimco & Sweets';

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname() ?? '';
  const { ready, canAny } = usePermissions();

  useEffect(() => {
    if (mobileOpen) {
      onMobileClose();
    }
  }, [pathname, mobileOpen, onMobileClose]);

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
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-stone-950/45 backdrop-blur-[2px] transition-opacity md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onMobileClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card text-card-foreground transition-transform duration-200 ease-out dark:border-stone-800 dark:bg-stone-900 md:static md:z-0 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0 md:shadow-none'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 dark:border-stone-800">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-gradient-soft shadow-brand-glow ring-1 ring-brand/20">
            <Image
              src="/brand-logo.png"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {appName}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-brand">
              Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main">
          {visibleGroups.map((group) => (
            <div key={group.title} className="mb-4 last:mb-0">
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`relative block rounded-lg px-2.5 py-2 text-sm transition-all duration-150 ${
                          active
                            ? 'bg-brand-gradient font-medium text-white shadow-brand-glow'
                            : 'text-stone-700 hover:bg-brand-soft dark:text-stone-300 dark:hover:bg-brand-soft'
                        }`}
                        title={item.description}
                      >
                        {active ? (
                          <span
                            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                            aria-hidden
                          />
                        ) : null}
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

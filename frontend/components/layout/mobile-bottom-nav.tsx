'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { bundleDealsApi } from '@/lib/api-client';
import { BadgePercent, Home, ShoppingBag, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  showDealsBadge?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/deals', label: 'Deals', icon: BadgePercent, showDealsBadge: true },
  { href: '/track-order', label: 'Track Order', icon: Truck },
];

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname || '/';
}

function isNavActive(href: string, pathname: string): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);
  const [dealsCount, setDealsCount] = useState(0);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    bundleDealsApi
      .list()
      .then((res) => {
        if (!cancelled) setDealsCount(res.data?.length ?? 0);
      })
      .catch(() => {
        if (!cancelled) setDealsCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!hasMounted) {
    return null;
  }

  return createPortal(
    <nav
      className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-[90] border-t border-gray-100 bg-white py-2 lg:hidden"
      aria-label="Mobile navigation"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex w-full items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon, showDealsBadge }) => {
          const active = isNavActive(href, pathname);
          const badgeCount = showDealsBadge ? dealsCount : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 no-underline transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} aria-hidden />
                {badgeCount != null && badgeCount > 0 ? (
                  <span
                    className="absolute -right-1.5 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold leading-none text-white"
                    aria-hidden
                  >
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                ) : null}
              </span>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>,
    document.body,
  );
}

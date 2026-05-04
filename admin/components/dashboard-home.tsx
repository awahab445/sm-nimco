'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/auth.store';

const quickLinks = [
  {
    href: '/orders',
    title: 'Orders',
    description: 'Review and fulfill customer orders',
    tag: 'Open queue',
  },
  {
    href: '/inventory',
    title: 'Inventory',
    description: 'Stock levels and low-stock alerts',
    tag: 'Stock',
  },
  {
    href: '/products',
    title: 'Products',
    description: 'Catalog, variants, and merchandising',
    tag: 'Catalog',
  },
  {
    href: '/payments',
    title: 'Payments',
    description: 'Payment methods and gateway settings',
    tag: 'Config',
  },
] as const;

export function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const displayName =
    user?.firstName || user?.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : null;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {displayName ? `Welcome back, ${displayName}` : 'Welcome'}
      </h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Mid-market commerce control center: manage catalog, customers, orders, and store
        configuration from one place. Use the sidebar to jump to any area—modules still under
        construction show a &quot;Coming soon&quot; notice until that phase ships.
      </p>

      <section className="mt-8" aria-labelledby="quick-links-heading">
        <h2 id="quick-links-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Quick links
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              >
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  {item.tag}
                </span>
                <span className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">{item.title}</span>
                <span className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

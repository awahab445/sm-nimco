'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            © {new Date().getFullYear()} Store. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/products"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Products
            </Link>
            <Link
              href="/cart"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Cart
            </Link>
            <Link
              href="/track-order"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Track order
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

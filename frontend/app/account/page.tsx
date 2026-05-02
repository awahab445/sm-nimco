'use client';

import { useAuthStore } from '@/lib/auth.store';
import Link from 'next/link';

export default function AccountPage() {
  const { user } = useAuthStore();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-50">
          Account Overview
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
          Welcome back! Here's a summary of your account.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-zinc-50">
            Account Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                Name
              </p>
              <p className="text-gray-900 dark:text-zinc-50">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                Email
              </p>
              <p className="text-gray-900 dark:text-zinc-50">{user?.email}</p>
            </div>
            {user?.phone && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                  Phone
                </p>
                <p className="text-gray-900 dark:text-zinc-50">{user.phone}</p>
              </div>
            )}
            {user?.isGuest !== undefined && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                  Account Type
                </p>
                <p className="text-gray-900 dark:text-zinc-50">
                  {user.isGuest ? 'Guest' : 'Registered'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-zinc-50">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/profile"
              className="block rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              Edit Profile
            </Link>
            <Link
              href="/orders"
              className="block rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              View Orders
            </Link>
            <Link
              href="/addresses"
              className="block rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              Manage Addresses
            </Link>
            <button
              disabled
              className="block w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              Payment Methods (Coming soon)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


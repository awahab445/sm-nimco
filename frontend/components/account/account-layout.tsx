'use client';

import { AccountSidebar } from './account-sidebar';
import { User } from '@/lib/auth.service';

interface AccountLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function AccountLayout({ children, user: initialUser }: AccountLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
            My Account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <AccountSidebar />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
              <div className="p-6">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


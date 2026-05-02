'use client';

import { useAuthStore } from '@/lib/auth.store';

export function AdminHeader() {
  const { user, logout, isLoading } = useAuthStore();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Admin</span>
        {user?.email ? (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => logout()}
        disabled={isLoading}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        Log out
      </button>
    </header>
  );
}

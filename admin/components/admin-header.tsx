'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth.store';
import { adminUi } from '@/lib/admin-ui';

type AdminHeaderProps = {
  /** Opens the sidebar on small screens */
  onMenuOpen?: () => void;
};

export function AdminHeader({ onMenuOpen }: AdminHeaderProps) {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-3 sm:px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onMenuOpen ? (
          <button
            type="button"
            onClick={onMenuOpen}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 md:hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Open navigation menu"
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>
        ) : null}
        <div className="min-w-0 flex flex-col">
          <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Back office
          </span>
          {user?.email ? (
            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email}</span>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className={`shrink-0 ${adminUi.btnSecondary}`}
      >
        Log out
      </button>
    </header>
  );
}

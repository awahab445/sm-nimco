'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth.store';
import { adminUi } from '@/lib/admin-ui';

type AdminHeaderProps = {
  /** Opens the sidebar on small screens */
  onMenuOpen?: () => void;
  /** Opens the global command palette */
  onSearchOpen?: () => void;
};

export function AdminHeader({ onMenuOpen, onSearchOpen }: AdminHeaderProps) {
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
            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onSearchOpen ? (
          <button
            type="button"
            onClick={onSearchOpen}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:px-3"
            aria-label="Open search (Ctrl+K)"
          >
            <SearchIcon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 md:inline">
              ⌘K
            </kbd>
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className={`shrink-0 ${adminUi.btnSecondary}`}
        >
          Log out
        </button>
      </div>
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

'use client';

import { AccountSidebar } from './account-sidebar';
import { User } from '@/lib/auth.service';

interface AccountLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function AccountLayout({ children, user: _user }: AccountLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <AccountSidebar />

          <main className="min-w-0 flex-1">
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="p-6">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

'use client';

import { AccountSidebar } from './account-sidebar';
import { User } from '@/lib/auth.service';
import { storefrontUi } from '@/lib/storefront-ui';

interface AccountLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function AccountLayout({ children, user: _user }: AccountLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-border/60 pb-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            My Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <AccountSidebar />

          <main className="min-w-0 flex-1">
            <div className={`${storefrontUi.card} border border-border p-6 shadow-product-card`}>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

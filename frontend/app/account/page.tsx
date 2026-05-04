'use client';

import { useAuthStore } from '@/lib/auth.store';
import Link from 'next/link';

export default function AccountPage() {
  const { user } = useAuthStore();

  const actionClass =
    'block rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2 focus:ring-offset-background';

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Account Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here&apos;s a summary of your account.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Account Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-foreground">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-foreground">{user?.email}</p>
            </div>
            {user?.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-foreground">{user.phone}</p>
              </div>
            )}
            {user?.isGuest !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                <p className="text-foreground">{user.isGuest ? 'Guest' : 'Registered'}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/profile" className={actionClass}>
              Edit Profile
            </Link>
            <Link href="/orders" className={actionClass}>
              View Orders
            </Link>
            <Link href="/addresses" className={actionClass}>
              Manage Addresses
            </Link>
            <button
              type="button"
              disabled
              className="block w-full cursor-not-allowed rounded-md border border-border bg-muted/50 px-4 py-2 text-left text-sm font-medium text-muted-foreground"
            >
              Payment Methods (Coming soon)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useAuthStore } from '@/lib/auth.store';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { subscriptionApi, type SubscriptionPlan } from '@/lib/api-client';

export default function AccountPage() {
  const { user } = useAuthStore();
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mySub, setMySub] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const actionClass =
    'block rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2 focus:ring-offset-background';

  const activePlans = useMemo(() => plans.filter((p) => p.isActive), [plans]);

  const loadSubscription = useCallback(async () => {
    setSubLoading(true);
    setSubError(null);
    try {
      const [p, s] = await Promise.all([
        subscriptionApi.listPlans(),
        subscriptionApi.mySubscription(),
      ]);
      setPlans(p);
      setMySub(s);
      const defaultPlanId = (p.find((x) => x.isActive)?.id ?? '') as string;
      setSelectedPlanId(defaultPlanId);
    } catch (e: any) {
      setSubError(e?.message || 'Failed to load subscription');
    } finally {
      setSubLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  async function onSubscribe(planId: string) {
    setActionLoading('subscribe');
    setSubError(null);
    try {
      await subscriptionApi.subscribe({ planId });
      await loadSubscription();
    } catch (e: any) {
      setSubError(e?.message || 'Subscribe failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function onCancel() {
    if (!window.confirm('Cancel your subscription?')) return;
    setActionLoading('cancel');
    setSubError(null);
    try {
      await subscriptionApi.cancel();
      await loadSubscription();
    } catch (e: any) {
      setSubError(e?.message || 'Cancel failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function onRenew() {
    setActionLoading('renew');
    setSubError(null);
    try {
      await subscriptionApi.renew();
      await loadSubscription();
    } catch (e: any) {
      setSubError(e?.message || 'Renew failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function onChangePlan(planId: string) {
    setActionLoading('change');
    setSubError(null);
    try {
      await subscriptionApi.changePlan({ planId });
      await loadSubscription();
    } catch (e: any) {
      setSubError(e?.message || 'Change plan failed');
    } finally {
      setActionLoading(null);
    }
  }

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

      <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Subscription</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your plan (subscribe, cancel, renew, or change plan).
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadSubscription()}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Refresh
          </button>
        </div>

        {subError ? (
          <p className="mt-4 rounded-md border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
            {subError}
          </p>
        ) : null}

        {subLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading subscription…</p>
        ) : mySub ? (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <p className="text-sm font-semibold text-foreground">{mySub.status}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Plan</p>
                <p className="text-sm font-semibold text-foreground">
                  {mySub.plan?.name} ({mySub.plan?.billingCycle})
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Renews / ends</p>
                <p className="text-sm font-semibold text-foreground">
                  {mySub.endDate ? new Date(mySub.endDate).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block w-full sm:max-w-xs">
                <span className="text-xs font-medium text-muted-foreground">Change plan</span>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {activePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.billingCycle}) — {String(p.price)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                disabled={!selectedPlanId || actionLoading !== null || selectedPlanId === mySub.planId}
                onClick={() => void onChangePlan(selectedPlanId)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {actionLoading === 'change' ? 'Changing…' : 'Change plan'}
              </button>
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={() => void onRenew()}
                className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                {actionLoading === 'renew' ? 'Renewing…' : 'Renew'}
              </button>
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={() => void onCancel()}
                className="rounded-md border border-destructive/40 bg-card px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? 'Canceling…' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              You don&apos;t have an active subscription yet.
            </p>
            {activePlans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active plans available.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {activePlans.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.billingCycle} • {String(p.price)}
                    </p>
                    <button
                      type="button"
                      disabled={actionLoading !== null}
                      onClick={() => void onSubscribe(p.id)}
                      className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                      {actionLoading === 'subscribe' ? 'Subscribing…' : 'Subscribe'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

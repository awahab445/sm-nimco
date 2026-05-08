'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createAdminSubscriptionPlan,
  deleteAdminSubscriptionPlan,
  fetchAdminSubscriptionPlans,
  updateAdminSubscriptionPlan,
  type BillingCycle,
  type SubscriptionPlan,
} from '@/lib/api/subscriptions';
import { formatApiError } from '@/lib/api/error-message';

type PlanDraft = {
  name: string;
  description: string;
  price: string;
  billingCycle: BillingCycle;
  featuresText: string;
  isActive: boolean;
};

const EMPTY_DRAFT: PlanDraft = {
  name: '',
  description: '',
  price: '',
  billingCycle: 'MONTHLY',
  featuresText: '',
  isActive: true,
};

export function SubscriptionsManager() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<PlanDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPlans(await fetchAdminSubscriptionPlans());
    } catch (e) {
      setError(formatApiError(e));
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalLabel = useMemo(
    () => `${plans.length} plan${plans.length === 1 ? '' : 's'}`,
    [plans.length],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const price = Number(draft.price);
      if (!Number.isFinite(price) || price < 0) {
        throw new Error('Price must be a valid non-negative number');
      }
      const features = draft.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        price,
        billingCycle: draft.billingCycle,
        features,
        isActive: draft.isActive,
      };

      if (editingId) {
        await updateAdminSubscriptionPlan(editingId, payload);
      } else {
        await createAdminSubscriptionPlan(payload);
      }
      setDraft(EMPTY_DRAFT);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Subscriptions
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage subscription plans for monthly and yearly billing.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-3 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {editingId ? 'Edit plan' : 'Create plan'}
          </h2>
          <Input label="Name" value={draft.name} onChange={(v) => setDraft((s) => ({ ...s, name: v }))} required />
          <Input label="Description" value={draft.description} onChange={(v) => setDraft((s) => ({ ...s, description: v }))} />
          <Input label="Price" type="number" value={draft.price} onChange={(v) => setDraft((s) => ({ ...s, price: v }))} required />
          <label className="mt-3 block">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Billing cycle</span>
            <select
              value={draft.billingCycle}
              onChange={(e) => setDraft((s) => ({ ...s, billingCycle: e.target.value as BillingCycle }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="MONTHLY">MONTHLY</option>
              <option value="YEARLY">YEARLY</option>
            </select>
          </label>
          <label className="mt-3 block">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Features (one per line)
            </span>
            <textarea
              rows={5}
              value={draft.featuresText}
              onChange={(e) => setDraft((s) => ({ ...s, featuresText: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => setDraft((s) => ({ ...s, isActive: e.target.checked }))}
            />
            Active
          </label>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
              onClick={() => {
                setDraft(EMPTY_DRAFT);
                setEditingId(null);
              }}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{totalLabel}</h3>
          {loading ? (
            <p className="mt-3 text-sm text-zinc-500">Loading...</p>
          ) : (
            <div className="mt-3 space-y-2">
              {plans.map((p) => (
                <div key={p.id} className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {p.name} <span className="text-xs font-normal">({p.billingCycle})</span>
                      </p>
                      <p className="text-xs text-zinc-500">
                        {p.isActive ? 'active' : 'inactive'} • {String(p.price)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                        onClick={() => {
                          setEditingId(p.id);
                          setDraft({
                            name: p.name,
                            description: p.description ?? '',
                            price: String(p.price),
                            billingCycle: p.billingCycle,
                            featuresText: Array.isArray(p.features)
                              ? p.features.join('\n')
                              : '',
                            isActive: p.isActive,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 dark:border-red-900/50 dark:text-red-300"
                        onClick={async () => {
                          if (!window.confirm('Delete this plan?')) return;
                          try {
                            await deleteAdminSubscriptionPlan(p.id);
                            await load();
                          } catch (e) {
                            setError(formatApiError(e));
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="mt-3 block">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      <input
        value={value}
        type={type}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </label>
  );
}

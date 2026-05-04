'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCustomerGroups, type CustomerGroup } from '@/lib/api/customer-groups';
import {
  deleteAdminCustomer,
  fetchAdminCustomer,
  updateAdminCustomer,
  type Customer,
} from '@/lib/api/customers';
import { formatApiError } from '@/lib/api/error-message';

function parseMetadataJson(raw: string): Record<string, unknown> {
  const t = raw.trim();
  if (!t) return {};
  const parsed = JSON.parse(t) as unknown;
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Metadata must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

export function CustomerDetailView({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [customerGroupId, setCustomerGroupId] = useState('');
  const [metadataJson, setMetadataJson] = useState('{}');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const c = await fetchAdminCustomer(customerId);
      setCustomer(c);
      setEmail(c.email);
      setFirstName(c.firstName ?? '');
      setLastName(c.lastName ?? '');
      setPhone(c.phone ?? '');
      setIsGuest(c.isGuest);
      setCustomerGroupId(c.customerGroupId);
      setMetadataJson(JSON.stringify(c.metadata ?? {}, null, 2));
    } catch (e) {
      setError(formatApiError(e));
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchCustomerGroups().then(setGroups).catch(() => setGroups([]));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!customerGroupId) {
      setFormError('Customer group is required');
      return;
    }
    let metadata: Record<string, unknown>;
    try {
      metadata = parseMetadataJson(metadataJson);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Invalid metadata');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateAdminCustomer(customerId, {
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        isGuest,
        customerGroupId,
        metadata,
      });
      setCustomer(updated);
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!customer) return;
    if (!window.confirm(`Delete customer ${customer.email}? This cannot be undone.`)) return;
    setDeleteError(null);
    try {
      await deleteAdminCustomer(customer.id);
      router.push('/customers');
    } catch (err) {
      setDeleteError(formatApiError(err));
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading customer…</p>;
  }

  if (error || !customer) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error ?? 'Not found.'}{' '}
        <Link href="/customers" className="underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/customers" className="text-sm text-zinc-600 underline dark:text-zinc-400">
        ← Customers
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {[customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email}
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-500">{customer.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/orders?customerId=${customer.id}`}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-600"
          >
            View orders
          </Link>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 dark:border-red-800 dark:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-zinc-500">
        “View orders” opens the orders screen with a <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">customerId</code>{' '}
        query (full list UI ships in Phase H).
      </p>

      {deleteError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {deleteError}
        </p>
      ) : null}

      <form
        onSubmit={(e) => void handleSave(e)}
        className="mt-6 space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
      >
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Edit profile</h2>

        {formError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {formError}
          </p>
        ) : null}

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={isGuest}
            onChange={(e) => setIsGuest(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Guest account
        </label>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Customer group *</label>
          <select
            value={customerGroupId}
            onChange={(e) => setCustomerGroupId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          >
            {customerGroupId && !groups.some((g) => g.id === customerGroupId) ? (
              <option value={customerGroupId}>
                {customer.customerGroup?.name ?? 'Current group'}
              </option>
            ) : null}
            {groups
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                  {g.isDefault ? ' (default)' : ''}
                </option>
              ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Changing the group updates segmentation for promotions and shipping (Phase F).
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Metadata (JSON)</label>
          <textarea
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

'use client';

import { adminUi } from '@/lib/admin-ui';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCustomerGroups, type CustomerGroup } from '@/lib/api/customer-groups';
import { createAdminCustomer } from '@/lib/api/customers';
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

export function CustomerCreateForm() {
  const router = useRouter();
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [customerGroupId, setCustomerGroupId] = useState('');
  const [metadataJson, setMetadataJson] = useState('{}');

  useEffect(() => {
    void fetchCustomerGroups().then(setGroups).catch(() => setGroups([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    let metadata: Record<string, unknown>;
    try {
      metadata = parseMetadataJson(metadataJson);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid metadata');
      return;
    }

    setSaving(true);
    try {
      const c = await createAdminCustomer({
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        isGuest,
        ...(customerGroupId ? { customerGroupId } : {}),
        metadata,
      });
      router.push(`/customers/${c.id}`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
    >
      <Link href="/customers" className="text-sm text-zinc-600 underline dark:text-zinc-400">
        ← Customers
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New customer</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        If you omit a group, the API assigns the <strong>default</strong> customer group.
      </p>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
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
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Customer group</label>
        <select
          value={customerGroupId}
          onChange={(e) => setCustomerGroupId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        >
          <option value="">Default group (API)</option>
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
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Metadata (JSON)</label>
        <textarea
          value={metadataJson}
          onChange={(e) => setMetadataJson(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className={adminUi.btnPrimary}
        >
          {saving ? 'Creating…' : 'Create customer'}
        </button>
        <Link
          href="/customers"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

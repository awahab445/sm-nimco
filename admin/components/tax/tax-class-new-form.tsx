'use client';

import { adminUi } from '@/lib/admin-ui';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createTaxClass } from '@/lib/api/tax';
import { formatApiError } from '@/lib/api/error-message';

export function TaxClassNewForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metadataJson, setMetadataJson] = useState('{}');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    let metadata: Record<string, unknown>;
    try {
      const m = JSON.parse(metadataJson) as unknown;
      if (m === null || typeof m !== 'object' || Array.isArray(m)) {
        throw new Error('invalid');
      }
      metadata = m as Record<string, unknown>;
    } catch {
      setError('Metadata must be a JSON object.');
      return;
    }
    if (!code.trim() || !name.trim()) {
      setError('Code and name are required.');
      return;
    }
    setSaving(true);
    try {
      const c = await createTaxClass({
        code: code.trim(),
        name: name.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        metadata,
      });
      router.push(`/tax/classes/${c.id}`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/tax" className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400">
        ← Tax
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New tax class
      </h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Code *</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={50}
            placeholder="standard, reduced, exempt…"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Metadata JSON</label>
          <textarea
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className={adminUi.btnPrimary}
          >
            {saving ? 'Saving…' : 'Create'}
          </button>
          <Link
            href="/tax"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

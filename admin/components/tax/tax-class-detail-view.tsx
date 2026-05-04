'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  deleteTaxClass,
  fetchTaxClass,
  updateTaxClass,
  type TaxClass,
} from '@/lib/api/tax';
import { formatApiError } from '@/lib/api/error-message';

export function TaxClassDetailView({ taxClassId }: { taxClassId: string }) {
  const router = useRouter();
  const [row, setRow] = useState<TaxClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metadataJson, setMetadataJson] = useState('{}');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const c = await fetchTaxClass(taxClassId);
      setRow(c);
      setCode(c.code);
      setName(c.name);
      setDescription(c.description ?? '');
      setMetadataJson(JSON.stringify(c.metadata ?? {}, null, 2));
    } catch (e) {
      setError(formatApiError(e));
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [taxClassId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    let metadata: Record<string, unknown>;
    try {
      const m = JSON.parse(metadataJson) as unknown;
      if (m === null || typeof m !== 'object' || Array.isArray(m)) {
        throw new Error('invalid');
      }
      metadata = m as Record<string, unknown>;
    } catch {
      setFormError('Metadata must be a JSON object.');
      return;
    }
    if (!code.trim() || !name.trim()) {
      setFormError('Code and name are required.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateTaxClass(taxClassId, {
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || null,
        metadata,
      });
      setRow(updated);
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    if (!row) return;
    if (
      !window.confirm(
        `Delete tax class “${row.name}”? Not allowed if any tax rates reference it.`,
      )
    ) {
      return;
    }
    try {
      await deleteTaxClass(taxClassId);
      router.push('/tax');
    } catch (err) {
      setDeleteError(formatApiError(err));
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (error || !row) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error ?? 'Not found.'}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/tax" className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400">
        ← Tax
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {row.name}
      </h1>
      <p className="mt-1 font-mono text-xs text-zinc-500">{row.id}</p>
      <p className="mt-2 text-sm">
        <Link
          href={`/tax/taxes/new?taxClassId=${encodeURIComponent(taxClassId)}`}
          className="font-medium text-zinc-900 underline dark:text-zinc-100"
        >
          Add rate for this class
        </Link>
      </p>

      <form onSubmit={handleSave} className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={50}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</label>
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
            rows={4}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        {formError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 dark:border-red-800 dark:text-red-300"
          >
            Delete
          </button>
        </div>
        {deleteError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
        ) : null}
      </form>
    </div>
  );
}

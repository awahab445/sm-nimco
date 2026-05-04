'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  deleteShippingZone,
  fetchMethodsByZone,
  fetchShippingZone,
  updateShippingZone,
  type ShippingMethod,
  type ShippingZone,
} from '@/lib/api/shipping';
import { formatApiError } from '@/lib/api/error-message';

export function ZoneDetailView({ zoneId }: { zoneId: string }) {
  const router = useRouter();
  const [zone, setZone] = useState<ShippingZone | null>(null);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [coverageJson, setCoverageJson] = useState('{}');
  const [metadataJson, setMetadataJson] = useState('{}');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [z, m] = await Promise.all([
        fetchShippingZone(zoneId),
        fetchMethodsByZone(zoneId, { includeInactive: true }),
      ]);
      setZone(z);
      setMethods(m);
      setName(z.name);
      setDescription(z.description ?? '');
      setPriority(String(z.priority));
      setIsActive(z.isActive);
      setCoverageJson(JSON.stringify(z.coverage ?? {}, null, 2));
      setMetadataJson(JSON.stringify(z.metadata ?? {}, null, 2));
    } catch (e) {
      setError(formatApiError(e));
      setZone(null);
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    let coverage: Record<string, unknown>;
    let metadata: Record<string, unknown>;
    try {
      coverage = JSON.parse(coverageJson) as Record<string, unknown>;
      if (typeof coverage !== 'object' || coverage === null || Array.isArray(coverage)) {
        throw new Error('invalid');
      }
    } catch {
      setFormError('Coverage must be a JSON object.');
      return;
    }
    try {
      metadata = JSON.parse(metadataJson) as Record<string, unknown>;
      if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
        throw new Error('invalid');
      }
    } catch {
      setFormError('Metadata must be a JSON object.');
      return;
    }
    const pr = Number(priority);
    setSaving(true);
    try {
      const updated = await updateShippingZone(zoneId, {
        name: name.trim(),
        description: description.trim() || undefined,
        coverage: coverage as ShippingZone['coverage'],
        priority: Number.isNaN(pr) ? 0 : pr,
        isActive,
        metadata,
      });
      setZone(updated);
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    if (!zone) return;
    if (!window.confirm(`Delete zone “${zone.name}”? Methods must be removed first.`)) return;
    try {
      await deleteShippingZone(zoneId);
      router.push('/shipping');
    } catch (err) {
      setDeleteError(formatApiError(err));
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (error || !zone) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error ?? 'Zone not found.'}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/shipping"
        className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
      >
        ← Shipping zones
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {zone.name}
      </h1>
      <p className="mt-1 font-mono text-xs text-zinc-500">{zone.id}</p>

      <form onSubmit={handleSave} className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Zone settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Priority</label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Coverage JSON</label>
          <textarea
            value={coverageJson}
            onChange={(e) => setCoverageJson(e.target.value)}
            rows={8}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
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
        {formError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? 'Saving…' : 'Save zone'}
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 dark:border-red-800 dark:text-red-300"
          >
            Delete zone
          </button>
        </div>
        {deleteError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
        ) : null}
      </form>

      <section className="mt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Methods</h2>
          <Link
            href={`/shipping/methods/new?zoneId=${encodeURIComponent(zoneId)}`}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            New method
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {methods.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">No methods in this zone.</div>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">Code</th>
                  <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                  <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">Type</th>
                  <th className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">Active</th>
                  <th className="px-4 py-2 text-right font-medium text-zinc-700 dark:text-zinc-300">
                    {' '}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {methods.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2 font-mono text-xs">{m.code}</td>
                    <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                      {m.name}
                    </td>
                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{m.type}</td>
                    <td className="px-4 py-2">{m.isActive ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/shipping/methods/${m.id}`}
                        className="font-medium text-zinc-900 underline dark:text-zinc-100"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

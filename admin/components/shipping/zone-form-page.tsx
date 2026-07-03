'use client';

import { adminUi } from '@/lib/admin-ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { createShippingZone, type ZoneCoverage } from '@/lib/api/shipping';
import { formatApiError } from '@/lib/api/error-message';

export function ZoneFormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [coverageJson, setCoverageJson] = useState(
    JSON.stringify({ countries: [], regions: [], cities: [] }, null, 2),
  );
  const [metadataJson, setMetadataJson] = useState('{}');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    let coverage: Record<string, unknown>;
    let metadata: Record<string, unknown>;
    try {
      coverage = JSON.parse(coverageJson) as Record<string, unknown>;
      if (typeof coverage !== 'object' || coverage === null || Array.isArray(coverage)) {
        throw new Error('invalid');
      }
    } catch {
      setError('Coverage must be a JSON object (countries, regions, cities arrays).');
      return;
    }
    try {
      metadata = JSON.parse(metadataJson) as Record<string, unknown>;
      if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
        throw new Error('invalid');
      }
    } catch {
      setError('Metadata must be a JSON object.');
      return;
    }

    const pr = Number(priority);
    setSaving(true);
    try {
      const z = await createShippingZone({
        name: name.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        coverage: coverage as ZoneCoverage,
        priority: Number.isNaN(pr) ? 0 : pr,
        isActive,
        metadata,
      });
      router.push(`/shipping/zones/${z.id}`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/shipping"
        className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
      >
        ← Shipping
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New shipping zone
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Coverage JSON
          </label>
          <textarea
            value={coverageJson}
            onChange={(e) => setCoverageJson(e.target.value)}
            rows={8}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Example:{' '}
            <span className="font-mono">
              {`{"countries":["PK","US"],"regions":[],"cities":[]}`}
            </span>
            . Empty arrays may match as a default zone depending on backend rules.
          </p>
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
            {saving ? 'Saving…' : 'Create zone'}
          </button>
          <Link
            href="/shipping"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

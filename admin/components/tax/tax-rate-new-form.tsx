'use client';

import { adminUi } from '@/lib/admin-ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createTaxRate, fetchTaxClasses, type TaxClass } from '@/lib/api/tax';
import { formatApiError } from '@/lib/api/error-message';

export function TaxRateNewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetClassId = searchParams.get('taxClassId')?.trim() ?? '';

  const [classes, setClasses] = useState<TaxClass[]>([]);
  const [taxClassId, setTaxClassId] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [rate, setRate] = useState('');
  const [isInclusive, setIsInclusive] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [metadataJson, setMetadataJson] = useState('{}');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchTaxClasses()
      .then((c) => {
        setClasses(c);
        if (presetClassId && c.some((x) => x.id === presetClassId)) {
          setTaxClassId(presetClassId);
        } else if (c[0]) {
          setTaxClassId((id) => id || c[0].id);
        }
      })
      .catch(() => setClasses([]));
  }, [presetClassId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!taxClassId) {
      setError('Select a tax class.');
      return;
    }
    const cc = country.trim().toUpperCase();
    if (cc.length !== 2) {
      setError('Country must be a 2-letter ISO code.');
      return;
    }
    const r = Number(rate);
    if (Number.isNaN(r) || r < 0 || r > 100) {
      setError('Rate must be a number between 0 and 100.');
      return;
    }
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

    setSaving(true);
    try {
      const t = await createTaxRate({
        taxClassId,
        country: cc,
        ...(region.trim() ? { region: region.trim() } : {}),
        rate: r,
        isInclusive,
        isActive,
        ...(startDate ? { startDate: new Date(startDate).toISOString() } : {}),
        ...(endDate ? { endDate: new Date(endDate).toISOString() } : {}),
        metadata,
      });
      router.push(`/tax/taxes/${t.id}`);
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
        New tax rate
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tax class *</label>
          <select
            value={taxClassId}
            onChange={(e) => setTaxClassId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {classes.length === 0 ? (
              <option value="">Loading…</option>
            ) : (
              classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Country (ISO-2) *
            </label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              maxLength={2}
              placeholder="PK"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm uppercase dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Region</label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              maxLength={100}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Rate % (0–100) *
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.0001"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={isInclusive}
              onChange={(e) => setIsInclusive(e.target.checked)}
            />
            Tax inclusive
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Start (local)
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              End (local)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
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
            disabled={saving || classes.length === 0}
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

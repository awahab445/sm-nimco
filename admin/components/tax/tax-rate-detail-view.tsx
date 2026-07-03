'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  deleteTaxRate,
  fetchTaxClasses,
  fetchTaxRate,
  updateTaxRate,
  type TaxClass,
  type TaxRate,
} from '@/lib/api/tax';
import { formatApiError } from '@/lib/api/error-message';

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaxRateDetailView({ taxId }: { taxId: string }) {
  const router = useRouter();
  const [row, setRow] = useState<TaxRate | null>(null);
  const [classes, setClasses] = useState<TaxClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [taxClassId, setTaxClassId] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [rate, setRate] = useState('');
  const [isInclusive, setIsInclusive] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [metadataJson, setMetadataJson] = useState('{}');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [t, c] = await Promise.all([fetchTaxRate(taxId), fetchTaxClasses()]);
      setRow(t);
      setClasses(c);
      setTaxClassId(t.taxClassId);
      setCountry(t.country);
      setRegion(t.region ?? '');
      setRate(String(t.rate));
      setIsInclusive(t.isInclusive);
      setIsActive(t.isActive);
      setStartDate(toLocalInput(t.startDate));
      setEndDate(toLocalInput(t.endDate));
      setMetadataJson(JSON.stringify(t.metadata ?? {}, null, 2));
    } catch (e) {
      setError(formatApiError(e));
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [taxId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const cc = country.trim().toUpperCase();
    if (cc.length !== 2) {
      setFormError('Country must be a 2-letter ISO code.');
      return;
    }
    const r = Number(rate);
    if (Number.isNaN(r) || r < 0 || r > 100) {
      setFormError('Rate must be a number between 0 and 100.');
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
      setFormError('Metadata must be a JSON object.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateTaxRate(taxId, {
        taxClassId,
        country: cc,
        region: region.trim() === '' ? null : region.trim(),
        rate: r,
        isInclusive,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        metadata,
      });
      setRow(updated);
      setStartDate(toLocalInput(updated.startDate));
      setEndDate(toLocalInput(updated.endDate));
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    if (!row) return;
    if (!window.confirm('Delete this tax rate?')) return;
    try {
      await deleteTaxRate(taxId);
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
        {row.country}
        {row.region ? ` / ${row.region}` : ''} · {row.rate}%
      </h1>
      <p className="mt-1 font-mono text-xs text-zinc-500">{row.id}</p>

      <form onSubmit={handleSave} className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tax class</label>
          <select
            value={taxClassId}
            onChange={(e) => setTaxClassId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              maxLength={2}
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
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Rate %</label>
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
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Start (local)</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">End (local)</label>
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
            className={adminUi.btnPrimary}
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

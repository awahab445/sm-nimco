'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  fetchTaxClasses,
  fetchTaxRates,
  type TaxClass,
  type TaxRate,
} from '@/lib/api/tax';
import { formatApiError } from '@/lib/api/error-message';

export function TaxHome() {
  const [classes, setClasses] = useState<TaxClass[]>([]);
  const [rates, setRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState('');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [c, t] = await Promise.all([fetchTaxClasses(), fetchTaxRates()]);
      setClasses(c);
      setRates(t);
    } catch (e) {
      setError(formatApiError(e));
      setClasses([]);
      setRates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const classById = useMemo(() => {
    const m = new Map<string, TaxClass>();
    classes.forEach((c) => m.set(c.id, c));
    return m;
  }, [classes]);

  const filteredRates = useMemo(() => {
    if (!classFilter) return rates;
    return rates.filter((r) => r.taxClassId === classFilter);
  }, [rates, classFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Tax
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Tax classes and jurisdiction rates via <span className="font-mono">/tax</span> (back-office
          only in this app).
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tax classes</h2>
          <Link
            href="/tax/classes/new"
            className={`shrink-0 ${adminUi.btnPrimary}`}
          >
            New class
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {loading ? (
            <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
          ) : classes.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">No tax classes.</div>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Code</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Description</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">
                    {' '}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {c.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/tax/classes/${c.id}`}
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

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tax rates</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Class</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="mt-1 block rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">All</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Link
              href={
                classFilter
                  ? `/tax/taxes/new?taxClassId=${encodeURIComponent(classFilter)}`
                  : '/tax/taxes/new'
              }
              className={adminUi.btnPrimary}
            >
              New rate
            </Link>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {loading ? (
            <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
          ) : filteredRates.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">No rates match.</div>
          ) : (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Class</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Country</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Region</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Rate %</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Inclusive</th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Active</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">
                    {' '}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredRates.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      {classById.get(r.taxClassId)?.code ?? r.taxClassId.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">{r.country}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.region ?? '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium">{r.rate}</td>
                    <td className="px-4 py-3">{r.isInclusive ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{r.isActive ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/tax/taxes/${r.id}`}
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

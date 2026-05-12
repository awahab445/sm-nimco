'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import {
  fetchStoreFilters,
  createStoreFilter,
  updateStoreFilter,
  deleteStoreFilter,
  createStoreFilterOption,
  updateStoreFilterOption,
  deleteStoreFilterOption,
  type StorefrontFilterRow,
  type StorefrontFilterKind,
  type StorefrontFilterOptionRow,
} from '@/lib/api/store-filters';
import { formatApiError } from '@/lib/api/error-message';

export function StoreFiltersManager() {
  const [rows, setRows] = useState<StorefrontFilterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [filterModal, setFilterModal] = useState(false);
  const [editingFilter, setEditingFilter] = useState<StorefrontFilterRow | null>(null);
  const [fCode, setFCode] = useState('');
  const [fName, setFName] = useState('');
  const [fKind, setFKind] = useState<StorefrontFilterKind>('ATTRIBUTE');
  const [fSort, setFSort] = useState('0');
  const [fActive, setFActive] = useState(true);
  const [fSaving, setFSaving] = useState(false);
  const [fErr, setFErr] = useState<string | null>(null);

  const [optModal, setOptModal] = useState(false);
  const [optFilterId, setOptFilterId] = useState<string | null>(null);
  const [editingOpt, setEditingOpt] = useState<StorefrontFilterOptionRow | null>(null);
  const [oVal, setOVal] = useState('');
  const [oLabel, setOLabel] = useState('');
  const [oSort, setOSort] = useState('0');
  const [oActive, setOActive] = useState(true);
  const [oSaving, setOSaving] = useState(false);
  const [oErr, setOErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setRows(await fetchStoreFilters());
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const hasCategory = rows.some((r) => r.kind === 'CATEGORY');
  const hasPrice = rows.some((r) => r.kind === 'PRICE');

  function openCreateFilter() {
    setEditingFilter(null);
    setFCode('');
    setFName('');
    setFKind('ATTRIBUTE');
    setFSort('0');
    setFActive(true);
    setFErr(null);
    setFilterModal(true);
  }

  function openEditFilter(row: StorefrontFilterRow) {
    setEditingFilter(row);
    setFCode(row.code);
    setFName(row.name);
    setFKind(row.kind);
    setFSort(String(row.sortOrder));
    setFActive(row.isActive);
    setFErr(null);
    setFilterModal(true);
  }

  async function submitFilter(e: React.FormEvent) {
    e.preventDefault();
    setFErr(null);
    setFSaving(true);
    try {
      const sortOrder = Math.max(0, parseInt(fSort, 10) || 0);
      if (editingFilter) {
        await updateStoreFilter(editingFilter.id, {
          code: fCode.trim(),
          name: fName.trim(),
          sortOrder,
          isActive: fActive,
        });
      } else {
        await createStoreFilter({
          code: fCode.trim(),
          name: fName.trim(),
          kind: fKind,
          sortOrder,
          isActive: fActive,
        });
      }
      setFilterModal(false);
      await load();
    } catch (err) {
      setFErr(formatApiError(err));
    } finally {
      setFSaving(false);
    }
  }

  async function handleDeleteFilter(row: StorefrontFilterRow) {
    if (!window.confirm(`Delete filter “${row.name}” (${row.code})? This removes it from the storefront listing.`)) return;
    setError(null);
    try {
      await deleteStoreFilter(row.id);
      await load();
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  function openCreateOption(filterId: string) {
    setOptFilterId(filterId);
    setEditingOpt(null);
    setOVal('');
    setOLabel('');
    setOSort('0');
    setOActive(true);
    setOErr(null);
    setOptModal(true);
  }

  function openEditOption(row: StorefrontFilterOptionRow) {
    setOptFilterId(row.filterId);
    setEditingOpt(row);
    setOVal(row.value);
    setOLabel(row.label ?? '');
    setOSort(String(row.sortOrder));
    setOActive(row.isActive);
    setOErr(null);
    setOptModal(true);
  }

  async function submitOption(e: React.FormEvent) {
    e.preventDefault();
    if (!optFilterId) return;
    setOErr(null);
    setOSaving(true);
    try {
      const sortOrder = Math.max(0, parseInt(oSort, 10) || 0);
      if (editingOpt) {
        await updateStoreFilterOption(editingOpt.id, {
          value: oVal.trim(),
          label: oLabel.trim() || undefined,
          sortOrder,
          isActive: oActive,
        });
      } else {
        await createStoreFilterOption(optFilterId, {
          value: oVal.trim(),
          label: oLabel.trim() || undefined,
          sortOrder,
          isActive: oActive,
        });
      }
      setOptModal(false);
      await load();
    } catch (err) {
      setOErr(formatApiError(err));
    } finally {
      setOSaving(false);
    }
  }

  async function handleDeleteOption(opt: StorefrontFilterOptionRow) {
    if (!window.confirm(`Delete option “${opt.label || opt.value}”?`)) return;
    setError(null);
    try {
      await deleteStoreFilterOption(opt.id);
      await load();
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Store filters</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Choose which filters appear on the shop product listing, set their <strong>display names</strong>, and for
        attribute filters define option values. Product JSON attributes must use the same <strong>code</strong> and{' '}
        <strong>value</strong> strings. One <strong>Category</strong> and one <strong>Price</strong> filter is allowed.
      </p>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={openCreateFilter}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New filter
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Code</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Kind</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Sort</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Active</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">{row.code}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{row.kind}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{row.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.isActive
                            ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                            : 'rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
                        }
                      >
                        {row.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.kind === 'ATTRIBUTE' ? (
                        <button
                          type="button"
                          onClick={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                          className="mr-2 text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
                        >
                          {expandedId === row.id ? 'Hide options' : 'Options'}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => openEditFilter(row)}
                        className="mr-2 text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteFilter(row)}
                        className="text-sm font-medium text-red-700 underline dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {row.kind === 'ATTRIBUTE' && expandedId === row.id ? (
                    <tr key={`${row.id}-opt`} className="bg-zinc-50 dark:bg-zinc-900/40">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Option values</p>
                          <button
                            type="button"
                            onClick={() => openCreateOption(row.id)}
                            className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600"
                          >
                            Add option
                          </button>
                        </div>
                        {row.options.length === 0 ? (
                          <p className="text-xs text-zinc-500">No options — listing will use values found on products.</p>
                        ) : (
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-zinc-500">
                                <th className="py-1 pr-2">Value</th>
                                <th className="py-1 pr-2">Label</th>
                                <th className="py-1 pr-2">Sort</th>
                                <th className="py-1 pr-2">Active</th>
                                <th className="py-1 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.options.map((o) => (
                                <tr key={o.id}>
                                  <td className="py-1 font-mono">{o.value}</td>
                                  <td className="py-1">{o.label || '—'}</td>
                                  <td className="py-1">{o.sortOrder}</td>
                                  <td className="py-1">{o.isActive ? 'Yes' : 'No'}</td>
                                  <td className="py-1 text-right">
                                    <button
                                      type="button"
                                      className="mr-2 underline"
                                      onClick={() => openEditOption(o)}
                                    >
                                      Edit
                                    </button>
                                    <button type="button" className="text-red-600 underline" onClick={() => void handleDeleteOption(o)}>
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filterModal ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <button type="button" className="absolute inset-0 bg-zinc-900/50" aria-label="Close" onClick={() => !fSaving && setFilterModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{editingFilter ? 'Edit filter' : 'New filter'}</h2>
            {fErr ? <p className="mt-2 text-sm text-red-600">{fErr}</p> : null}
            <form onSubmit={(e) => void submitFilter(e)} className="mt-4 space-y-3">
              {!editingFilter ? (
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kind</label>
                  <select
                    value={fKind}
                    onChange={(e) => setFKind(e.target.value as StorefrontFilterKind)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  >
                    <option value="ATTRIBUTE">Attribute (checkboxes; needs product JSON key = code)</option>
                    <option value="CATEGORY" disabled={hasCategory}>
                      Category{hasCategory ? ' (already exists)' : ''}
                    </option>
                    <option value="PRICE" disabled={hasPrice}>
                      Price{hasPrice ? ' (already exists)' : ''}
                    </option>
                  </select>
                </div>
              ) : null}
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Code</label>
                <input
                  value={fCode}
                  onChange={(e) => setFCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  placeholder="e.g. color"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Display name</label>
                <input
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  placeholder="Shown on storefront"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sort order</label>
                <input
                  type="number"
                  min={0}
                  value={fSort}
                  onChange={(e) => setFSort(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={fActive} onChange={(e) => setFActive(e.target.checked)} />
                Active on storefront
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="rounded-lg border px-3 py-2 text-sm dark:border-zinc-600" onClick={() => !fSaving && setFilterModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={fSaving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {fSaving ? 'Saving…' : editingFilter ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {optModal ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <button type="button" className="absolute inset-0 bg-zinc-900/50" aria-label="Close" onClick={() => !oSaving && setOptModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{editingOpt ? 'Edit option' : 'New option'}</h2>
            {oErr ? <p className="mt-2 text-sm text-red-600">{oErr}</p> : null}
            <form onSubmit={(e) => void submitOption(e)} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Value</label>
                <input
                  value={oVal}
                  onChange={(e) => setOVal(e.target.value)}
                  disabled={!!editingOpt}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Label</label>
                <input
                  value={oLabel}
                  onChange={(e) => setOLabel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  placeholder="Optional storefront label"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sort</label>
                <input type="number" min={0} value={oSort} onChange={(e) => setOSort(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={oActive} onChange={(e) => setOActive(e.target.checked)} />
                Active
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="rounded-lg border px-3 py-2 text-sm dark:border-zinc-600" onClick={() => !oSaving && setOptModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={oSaving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {oSaving ? 'Saving…' : editingOpt ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

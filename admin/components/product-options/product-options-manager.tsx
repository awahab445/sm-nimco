'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createProductOption,
  createProductOptionValue,
  deleteProductOption,
  deleteProductOptionValue,
  fetchProductOptionsCatalog,
  updateProductOption,
  updateProductOptionValue,
  type ProductOption,
  type ProductOptionValue,
} from '@/lib/api/product-options';
import { formatApiError } from '@/lib/api/error-message';

function normalizeCode(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function ProductOptionsManager() {
  const [rows, setRows] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createCode, setCreateCode] = useState('');
  const [createActive, setCreateActive] = useState(true);
  const [creating, setCreating] = useState(false);

  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [savingOption, setSavingOption] = useState(false);

  const [valueModal, setValueModal] = useState<{
    option: ProductOption;
    value: ProductOptionValue | null;
  } | null>(null);
  const [valueText, setValueText] = useState('');
  const [valueCode, setValueCode] = useState('');
  const [valueSortOrder, setValueSortOrder] = useState('0');
  const [valueActive, setValueActive] = useState(true);
  const [savingValue, setSavingValue] = useState(false);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const data = await fetchProductOptionsCatalog();
      setRows(data);
    } catch (e) {
      setErr(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((o) => {
      if (o.name.toLowerCase().includes(q)) return true;
      if (o.code.toLowerCase().includes(q)) return true;
      return o.values.some((v) => v.value.toLowerCase().includes(q));
    });
  }, [rows, search]);

  function openCreate() {
    setCreateName('');
    setCreateCode('');
    setCreateActive(true);
    setErr(null);
    setCreateOpen(true);
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const name = createName.trim();
    const code = normalizeCode(createCode || name);
    if (!name) {
      setErr('Name is required');
      return;
    }
    if (!code) {
      setErr('Code is required');
      return;
    }
    setCreating(true);
    try {
      await createProductOption({ name, code, isActive: createActive });
      setCreateOpen(false);
      await load();
    } catch (e2) {
      setErr(formatApiError(e2));
    } finally {
      setCreating(false);
    }
  }

  function openEdit(option: ProductOption) {
    setEditingOption(option);
    setEditName(option.name);
    setEditCode(option.code);
    setEditActive(option.isActive);
    setErr(null);
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOption) return;
    setErr(null);
    const name = editName.trim();
    const code = normalizeCode(editCode);
    if (!name) {
      setErr('Name is required');
      return;
    }
    if (!code) {
      setErr('Code is required');
      return;
    }
    setSavingOption(true);
    try {
      await updateProductOption(editingOption.id, { name, code, isActive: editActive });
      setEditingOption(null);
      await load();
    } catch (e2) {
      setErr(formatApiError(e2));
    } finally {
      setSavingOption(false);
    }
  }

  async function removeOption(option: ProductOption) {
    if (!window.confirm(`Delete option “${option.name}” (${option.code})? This also deletes its values.`)) {
      return;
    }
    setErr(null);
    try {
      await deleteProductOption(option.id);
      await load();
    } catch (e) {
      setErr(formatApiError(e));
    }
  }

  function openCreateValue(option: ProductOption) {
    setValueModal({ option, value: null });
    setValueText('');
    setValueCode('');
    setValueSortOrder('0');
    setValueActive(true);
    setErr(null);
  }

  function openEditValue(option: ProductOption, value: ProductOptionValue) {
    setValueModal({ option, value });
    setValueText(value.value);
    setValueCode(value.code ?? '');
    setValueSortOrder(String(value.sortOrder ?? 0));
    setValueActive(value.isActive);
    setErr(null);
  }

  async function submitValue(e: React.FormEvent) {
    e.preventDefault();
    if (!valueModal) return;
    setErr(null);
    const value = valueText.trim();
    if (!value) {
      setErr('Value is required');
      return;
    }
    const sortOrder = Math.max(0, parseInt(valueSortOrder, 10) || 0);
    const code = valueCode.trim() || undefined;
    setSavingValue(true);
    try {
      if (valueModal.value) {
        await updateProductOptionValue(valueModal.value.id, {
          value,
          code: code ?? null,
          sortOrder,
          isActive: valueActive,
        });
      } else {
        await createProductOptionValue(valueModal.option.id, {
          value,
          ...(code ? { code } : {}),
          sortOrder,
          isActive: valueActive,
        });
      }
      setValueModal(null);
      await load();
    } catch (e2) {
      setErr(formatApiError(e2));
    } finally {
      setSavingValue(false);
    }
  }

  async function removeValue(option: ProductOption, value: ProductOptionValue) {
    if (!window.confirm(`Delete value “${value.value}” from option “${option.name}”?`)) return;
    setErr(null);
    try {
      await deleteProductOptionValue(value.id);
      await load();
    } catch (e) {
      setErr(formatApiError(e));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Product options
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage the global option catalog (options and their values). Products can then select
            required options and values on the General tab.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New option
        </button>
      </div>

      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Catalog</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by option, code, or value…"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 sm:w-80"
          />
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-zinc-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="mt-4 text-sm text-zinc-500">No options found.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {filtered.map((o) => (
              <div key={o.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {o.name}
                      </div>
                      <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                        {o.code}
                      </code>
                      {o.isActive ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {o.values.length} value{o.values.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openCreateValue(o)}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
                    >
                      Add value
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(o)}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeOption(o)}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 dark:border-red-800 dark:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                      <tr>
                        <th className="px-3 py-2 font-medium">Value</th>
                        <th className="px-3 py-2 font-medium">Code</th>
                        <th className="px-3 py-2 font-medium">Sort</th>
                        <th className="px-3 py-2 font-medium">Active</th>
                        <th className="px-3 py-2 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {o.values.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-zinc-500">
                            No values yet.
                          </td>
                        </tr>
                      ) : (
                        o.values.map((v) => (
                          <tr key={v.id}>
                            <td className="px-3 py-2 font-medium">{v.value}</td>
                            <td className="px-3 py-2 text-xs text-zinc-500">
                              {v.code || '—'}
                            </td>
                            <td className="px-3 py-2">{v.sortOrder ?? 0}</td>
                            <td className="px-3 py-2">{v.isActive ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                className="mr-3 underline"
                                onClick={() => openEditValue(o, v)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="text-red-700 underline dark:text-red-400"
                                onClick={() => void removeValue(o, v)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/50"
            aria-label="Close"
            onClick={() => setCreateOpen(false)}
          />
          <form
            onSubmit={(e) => void submitCreate(e)}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">New option</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</label>
                <input
                  value={createName}
                  onChange={(e) => {
                    setCreateName(e.target.value);
                    if (!createCode.trim()) setCreateCode(e.target.value);
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Code</label>
                <input
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value)}
                  placeholder="e.g. size, color (auto-normalized)"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Normalized: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">{normalizeCode(createCode || createName || '') || '—'}</code>
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={createActive}
                  onChange={(e) => setCreateActive(e.target.checked)}
                />
                Active
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg border px-3 py-1.5 text-sm dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {editingOption ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/50"
            aria-label="Close"
            onClick={() => setEditingOption(null)}
          />
          <form
            onSubmit={(e) => void submitEdit(e)}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Edit option</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Code</label>
                <input
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                />
                Active
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingOption(null)}
                className="rounded-lg border px-3 py-1.5 text-sm dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingOption}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {savingOption ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {valueModal ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/50"
            aria-label="Close"
            onClick={() => setValueModal(null)}
          />
          <form
            onSubmit={(e) => void submitValue(e)}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              {valueModal.value ? 'Edit value' : 'New value'}{' '}
              <span className="text-xs text-zinc-500">({valueModal.option.name})</span>
            </h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Value</label>
                <input
                  value={valueText}
                  onChange={(e) => setValueText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Code (optional)</label>
                <input
                  value={valueCode}
                  onChange={(e) => setValueCode(e.target.value)}
                  placeholder="Stable token for SKU/import (e.g. RED, XL)"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Sort order</label>
                  <input
                    type="number"
                    min={0}
                    value={valueSortOrder}
                    onChange={(e) => setValueSortOrder(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                </div>
                <label className="mt-6 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={valueActive}
                    onChange={(e) => setValueActive(e.target.checked)}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setValueModal(null)}
                className="rounded-lg border px-3 py-1.5 text-sm dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingValue}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {savingValue ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}


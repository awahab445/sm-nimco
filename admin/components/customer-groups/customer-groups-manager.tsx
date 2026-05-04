'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createCustomerGroup,
  deleteCustomerGroup,
  fetchCustomerGroups,
  fetchDefaultCustomerGroup,
  updateCustomerGroup,
  type CustomerGroup,
} from '@/lib/api/customer-groups';
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

type FilterDefault = 'all' | 'yes' | 'no';

export function CustomerGroupsManager() {
  const [rows, setRows] = useState<CustomerGroup[]>([]);
  const [defaultFromApi, setDefaultFromApi] = useState<CustomerGroup | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterDefault, setFilterDefault] = useState<FilterDefault>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerGroup | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [taxClassId, setTaxClassId] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [metadataJson, setMetadataJson] = useState('{}');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setListError(null);
    setLoading(true);
    try {
      const [list, def] = await Promise.all([
        fetchCustomerGroups({
          search: search.trim() || undefined,
          ...(filterDefault === 'yes' ? { isDefault: true } : {}),
          ...(filterDefault === 'no' ? { isDefault: false } : {}),
        }),
        fetchDefaultCustomerGroup(),
      ]);
      setRows(list);
      setDefaultFromApi(def);
    } catch (e) {
      setListError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [search, filterDefault]);

  useEffect(() => {
    void load();
  }, [load]);

  const sortedRows = useMemo(() => {
    return rows.slice().sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [rows]);

  const defaultGroup = defaultFromApi ?? sortedRows.find((r) => r.isDefault) ?? null;

  function openCreate() {
    setEditing(null);
    setName('');
    setDescription('');
    setIsDefault(false);
    setTaxClassId('');
    setDiscountPercent('');
    setMetadataJson('{}');
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(g: CustomerGroup) {
    setEditing(g);
    setName(g.name);
    setDescription(g.description ?? '');
    setIsDefault(g.isDefault);
    setTaxClassId(g.taxClassId ?? '');
    setDiscountPercent(
      g.discountPercent != null && !Number.isNaN(g.discountPercent) ? String(g.discountPercent) : '',
    );
    setMetadataJson(JSON.stringify(g.metadata ?? {}, null, 2));
    setFormError(null);
    setModalOpen(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError('Name is required');
      return;
    }
    let metadata: Record<string, unknown>;
    try {
      metadata = parseMetadataJson(metadataJson);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Invalid metadata JSON');
      return;
    }
    let discount: number | undefined;
    if (discountPercent.trim()) {
      const d = parseFloat(discountPercent);
      if (!Number.isFinite(d) || d < 0 || d > 100) {
        setFormError('Discount must be between 0 and 100');
        return;
      }
      discount = d;
    }

    const body = {
      name: trimmed,
      description: description.trim() || undefined,
      isDefault,
      taxClassId: taxClassId.trim() || undefined,
      ...(discount !== undefined ? { discountPercent: discount } : {}),
      metadata,
    };

    setSaving(true);
    try {
      if (editing) {
        await updateCustomerGroup(editing.id, body);
      } else {
        await createCustomerGroup(body);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(g: CustomerGroup) {
    setDeleteError(null);
    if (
      !window.confirm(
        `Delete group “${g.name}”? ${g.customerCount ? `It has ${g.customerCount} customer(s) — deletion will be blocked.` : ''}`,
      )
    ) {
      return;
    }
    try {
      await deleteCustomerGroup(g.id);
      await load();
    } catch (err) {
      setDeleteError(formatApiError(err));
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Customer groups
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Segments for promotions, shipping rules, and pricing. One group should be marked{' '}
            <strong>default</strong> for new customers.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New group
        </button>
      </div>

      <div
        className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
          defaultGroup
            ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100'
            : 'border-amber-200 bg-amber-50/90 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100'
        }`}
      >
        {defaultGroup ? (
          <>
            <span className="font-semibold">Default group:</span>{' '}
            <span>{defaultGroup.name}</span>
            {defaultGroup.description ? (
              <span className="text-emerald-800/80 dark:text-emerald-200/80"> — {defaultGroup.description}</span>
            ) : null}
          </>
        ) : (
          <span>No default customer group is set. Mark one group as default so new shoppers can be assigned.</span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Search</label>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name or description"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="sm:w-48">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Default flag</label>
          <select
            value={filterDefault}
            onChange={(e) => setFilterDefault(e.target.value as FilterDefault)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="all">All groups</option>
            <option value="yes">Default only</option>
            <option value="no">Non-default only</option>
          </select>
        </div>
      </div>

      {listError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {listError}
        </p>
      ) : null}
      {deleteError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {deleteError}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
        ) : sortedRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No groups match this filter.</div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Description</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Discount %</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Customers</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sortedRows.map((g) => (
                <tr key={g.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{g.name}</div>
                    {g.isDefault ? (
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                        Default
                      </span>
                    ) : null}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {g.description ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {g.discountPercent != null ? `${g.discountPercent}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{g.customerCount ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="mr-2 underline" onClick={() => openEdit(g)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-700 underline dark:text-red-400"
                      onClick={() => void remove(g)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]"
            aria-label="Close"
            onClick={() => !saving && setModalOpen(false)}
          />
          <form
            onSubmit={(e) => void submitForm(e)}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {editing ? 'Edit group' : 'New group'}
            </h2>
            {formError ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                {formError}
              </p>
            ) : null}
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                Default group (replaces any previous default)
              </label>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tax class ID</label>
                <input
                  value={taxClassId}
                  onChange={(e) => setTaxClassId(e.target.value)}
                  placeholder="Optional UUID"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Discount % (0–100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
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
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {saving ? 'Saving…' : editing ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

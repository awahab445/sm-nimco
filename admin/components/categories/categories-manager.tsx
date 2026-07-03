'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteAdminCategory,
  fetchAdminCategories,
  type AdminCategoryListItem,
} from '@/lib/api/categories';
import { formatApiError } from '@/lib/api/error-message';
import { CategoryFormModal } from './category-form-modal';

export function CategoriesManager() {
  const [rows, setRows] = useState<AdminCategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [parentFilter, setParentFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<AdminCategoryListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setListError(null);
    setLoading(true);
    try {
      const data = await fetchAdminCategories();
      setRows(data);
    } catch (e) {
      setListError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const parentNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) m.set(r.id, r.name);
    return m;
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (parentFilter === 'all') return rows;
    if (parentFilter === '__root__') return rows.filter((r) => !r.parentId);
    return rows.filter((r) => r.parentId === parentFilter);
  }, [rows, parentFilter]);

  const sortedDisplay = useMemo(() => {
    return filteredRows.slice().sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      return a.name.localeCompare(b.name);
    });
  }, [filteredRows]);

  function openCreate() {
    setEditing(null);
    setModalMode('create');
    setModalOpen(true);
  }

  function openEdit(row: AdminCategoryListItem) {
    setEditing(row);
    setModalMode('edit');
    setModalOpen(true);
  }

  async function handleDelete(row: AdminCategoryListItem) {
    setDeleteError(null);
    const assigned = row.productCount > 0;
    const msg = assigned
      ? `Delete “${row.name}”? Product links will be removed (${row.productCount} products).`
      : `Delete “${row.name}”? Child categories will become top-level.`;
    if (!window.confirm(msg)) return;
    try {
      await deleteAdminCategory(row.id);
      await load();
    } catch (e) {
      setDeleteError(formatApiError(e));
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Categories
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage the catalog tree, visibility, and sort order. Inactive categories stay hidden on
            the storefront product listing and filters.
          </p>
          <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-100">
            <p className="font-medium text-sky-900 dark:text-sky-50">Price and listing filters are not set here</p>
            <p className="mt-1 text-sky-900/90 dark:text-sky-100/90">
              Open <strong>Products</strong>, choose a product, then use the <strong>General</strong> tab for{' '}
              <strong>base price</strong> and product <strong>attributes</strong> (JSON). Use the{' '}
              <strong>Categories</strong> tab on that product only to link it to categories. Configure storefront
              listing filters under <strong>Configuration → Store filters</strong>.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className={`shrink-0 ${adminUi.btnPrimary}`}
        >
          New category
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-2">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Filter by parent</span>
          <select
            value={parentFilter}
            onChange={(e) => setParentFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="all">All categories</option>
            <option value="__root__">Top level only</option>
            {rows
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  Children of: {c.name}
                </option>
              ))}
          </select>
        </label>
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
          <div className="p-8 text-center text-sm text-zinc-500">Loading categories…</div>
        ) : sortedDisplay.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            {rows.length === 0
              ? 'No categories yet. Create a top-level category to organize products on the storefront.'
              : 'No categories match this filter.'}
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Slug</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Parent</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Position</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Active</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Products</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sortedDisplay.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{row.name}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{row.slug}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {row.parentId ? parentNameById.get(row.parentId) ?? row.parentId : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{row.position}</td>
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
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{row.productCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="mr-2 text-sm font-medium text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(row)}
                      className="text-sm font-medium text-red-700 underline hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

      <CategoryFormModal
        open={modalOpen}
        mode={modalMode}
        editing={editing}
        categories={rows}
        onClose={() => setModalOpen(false)}
        onSaved={() => void load()}
      />
    </div>
  );
}

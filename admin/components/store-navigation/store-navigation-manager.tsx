'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAdminCategories, type AdminCategoryListItem } from '@/lib/api/categories';
import {
  createStorefrontNavItem,
  deleteStorefrontNavItem,
  fetchStorefrontNavigation,
  reorderStorefrontNavigation,
  updateStorefrontNavItem,
  type StorefrontNavRow,
  type StorefrontNavZone,
} from '@/lib/api/storefront-navigation';
import { formatApiError } from '@/lib/api/error-message';

type TreeNode = StorefrontNavRow & { children: TreeNode[] };

function buildTree(rows: StorefrontNavRow[], zone: StorefrontNavZone): TreeNode[] {
  const filtered = rows.filter((r) => r.zone === zone);
  const byParent = new Map<string | null, StorefrontNavRow[]>();
  for (const row of filtered) {
    const key = row.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(row);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  }
  const walk = (parentId: string | null): TreeNode[] =>
    (byParent.get(parentId) ?? []).map((row) => ({ ...row, children: walk(row.id) }));
  return walk(null);
}

function flattenTree(nodes: TreeNode[], depth = 0): Array<TreeNode & { depth: number }> {
  const out: Array<TreeNode & { depth: number }> = [];
  for (const node of nodes) {
    out.push({ ...node, depth });
    out.push(...flattenTree(node.children, depth + 1));
  }
  return out;
}

type FormState = {
  label: string;
  href: string;
  secondaryLabel: string;
  sortOrder: string;
  isActive: boolean;
  openMegaMenu: boolean;
  categoryId: string;
  parentId: string;
};

const emptyForm = (sortOrder: number, parentId = ''): FormState => ({
  label: '',
  href: '/',
  secondaryLabel: '',
  sortOrder: String(sortOrder),
  isActive: true,
  openMegaMenu: false,
  categoryId: '',
  parentId,
});

export function StoreNavigationManager() {
  const [rows, setRows] = useState<StorefrontNavRow[]>([]);
  const [categories, setCategories] = useState<AdminCategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<StorefrontNavRow | null>(null);
  const [modalZone, setModalZone] = useState<StorefrontNavZone>('mega');
  const [form, setForm] = useState<FormState>(emptyForm(0));
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [nav, cats] = await Promise.all([fetchStorefrontNavigation(), fetchAdminCategories()]);
      setRows(nav);
      setCategories(cats);
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

  const headerRows = useMemo(
    () => rows.filter((r) => r.zone === 'header').sort((a, b) => a.sortOrder - b.sortOrder),
    [rows],
  );
  const megaTree = useMemo(() => buildTree(rows, 'mega'), [rows]);
  const megaFlat = useMemo(() => flattenTree(megaTree), [megaTree]);

  const categoryOptions = useMemo(
    () => categories.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  const parentOptions = useMemo(() => {
    const exclude = new Set<string>();
    if (editing) {
      exclude.add(editing.id);
      const markDesc = (id: string) => {
        for (const r of rows) {
          if (r.parentId === id) {
            exclude.add(r.id);
            markDesc(r.id);
          }
        }
      };
      markDesc(editing.id);
    }
    return rows.filter((r) => r.zone === 'mega' && !exclude.has(r.id));
  }, [rows, editing]);

  function openCreate(zone: StorefrontNavZone, parentId: string | null = null) {
    setEditing(null);
    setModalZone(zone);
    const zoneRows = rows.filter((r) => r.zone === zone);
    const maxSort = zoneRows.reduce((m, r) => Math.max(m, r.sortOrder), 0);
    setForm(emptyForm(maxSort + 10, parentId ?? ''));
    setFormErr(null);
    setModal(true);
  }

  function openEdit(row: StorefrontNavRow) {
    setEditing(row);
    setModalZone(row.zone);
    setForm({
      label: row.label,
      href: row.href || '/',
      secondaryLabel: row.secondaryLabel ?? '',
      sortOrder: String(row.sortOrder),
      isActive: row.isActive,
      openMegaMenu: row.openMegaMenu,
      categoryId: row.categoryId ?? '',
      parentId: row.parentId ?? '',
    });
    setFormErr(null);
    setModal(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    setSaving(true);
    try {
      const sort = Math.max(0, parseInt(form.sortOrder, 10) || 0);
      const body = {
        label: form.label.trim(),
        secondaryLabel: form.secondaryLabel.trim() || null,
        href: form.categoryId ? '' : form.href.trim() || '/',
        sortOrder: sort,
        isActive: form.isActive,
        openMegaMenu: modalZone === 'header' ? form.openMegaMenu : false,
        zone: modalZone,
        parentId: modalZone === 'mega' ? form.parentId || null : null,
        categoryId: form.categoryId || null,
        kind: 'LINK' as const,
      };
      if (editing) await updateStorefrontNavItem(editing.id, body);
      else await createStorefrontNavItem(body);
      setModal(false);
      await load();
    } catch (err) {
      setFormErr(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: StorefrontNavRow) {
    if (!window.confirm(`Delete “${row.label}” and any nested items?`)) return;
    try {
      await deleteStorefrontNavItem(row.id);
      await load();
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  async function persistMegaOrder(nextFlat: Array<TreeNode & { depth: number }>) {
    await reorderStorefrontNavigation({
      items: nextFlat.map((row, index) => ({
        id: row.id,
        parentId: row.parentId,
        sortOrder: index * 10,
        zone: 'mega' as const,
      })),
    });
    await load();
  }

  async function onDropMega(targetId: string, mode: 'before' | 'child') {
    if (!dragId || dragId === targetId) return;
    const dragged = megaFlat.find((r) => r.id === dragId);
    const target = megaFlat.find((r) => r.id === targetId);
    if (!dragged || !target) return;

    const next = megaFlat.map((r) => ({ ...r }));
    const dragIdx = next.findIndex((r) => r.id === dragId);
    const [item] = next.splice(dragIdx, 1);

    if (mode === 'child') {
      item.parentId = targetId;
      item.depth = target.depth + 1;
      const targetIdx = next.findIndex((r) => r.id === targetId);
      next.splice(targetIdx + 1, 0, item);
    } else {
      item.parentId = target.parentId;
      item.depth = target.depth;
      const targetIdx = next.findIndex((r) => r.id === targetId);
      next.splice(targetIdx, 0, item);
    }

    try {
      await persistMegaOrder(next);
    } catch (e) {
      setError(formatApiError(e));
    }
    setDragId(null);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Store navigation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the header bar and layered mega menu. Link items to catalog categories or set custom URLs.
          Product categories are for catalog organization only — navigation is configured here.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Header bar</h2>
              <button
                type="button"
                onClick={() => openCreate('header')}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                Add header link
              </button>
            </div>
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {headerRows.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">No header links yet.</li>
              ) : (
                headerRows.map((row) => (
                  <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">
                        {row.label}
                        {row.openMegaMenu ? (
                          <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                            Mega menu
                          </span>
                        ) : null}
                        {!row.isActive ? (
                          <span className="ml-2 text-xs text-muted-foreground">(inactive)</span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {row.category?.slug ? `/categories/${row.category.slug}` : row.href || '—'} · sort{' '}
                        {row.sortOrder}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="text-xs underline" onClick={() => openEdit(row)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-destructive underline"
                        onClick={() => void handleDelete(row)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Mega menu (layered navigation)</h2>
                <p className="text-xs text-muted-foreground">Drag rows to reorder; drop on “Make child” to nest.</p>
              </div>
              <button
                type="button"
                onClick={() => openCreate('mega')}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                Add menu item
              </button>
            </div>
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {megaFlat.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No mega menu items. Add parents and children here.
                </li>
              ) : (
                megaFlat.map((row) => (
                  <li
                    key={row.id}
                    draggable
                    onDragStart={() => setDragId(row.id)}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => void onDropMega(row.id, 'before')}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm"
                    style={{ paddingLeft: `${16 + row.depth * 20}px` }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        <span className="mr-2 cursor-grab text-muted-foreground" aria-hidden>
                          ⠿
                        </span>
                        {row.label}
                        {row.category ? (
                          <span className="ml-2 text-xs text-muted-foreground">→ {row.category.name}</span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {row.category?.slug ? `/categories/${row.category.slug}` : row.href || '—'}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        className="text-xs text-muted-foreground underline"
                        onClick={() => void onDropMega(row.id, 'child')}
                        title="Nest dragged item under this row"
                      >
                        Make child
                      </button>
                      <button type="button" className="text-xs underline" onClick={() => openCreate('mega', row.id)}>
                        + Child
                      </button>
                      <button type="button" className="text-xs underline" onClick={() => openEdit(row)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-destructive underline"
                        onClick={() => void handleDelete(row)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      )}

      {modal ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal>
          <form
            onSubmit={(e) => void submitForm(e)}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto space-y-4 rounded-xl border border-border bg-background p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">
              {editing ? 'Edit' : 'New'} {modalZone === 'header' ? 'header link' : 'mega menu item'}
            </h2>
            {formErr ? <p className="text-sm text-destructive">{formErr}</p> : null}

            <label className="block text-xs font-medium text-muted-foreground">
              Label
              <input
                required
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-xs font-medium text-muted-foreground">
              Link to category (optional)
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              >
                <option value="">— Custom URL —</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>
            </label>

            {!form.categoryId ? (
              <label className="block text-xs font-medium text-muted-foreground">
                URL path
                <input
                  value={form.href}
                  onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-mono"
                  placeholder="/products"
                />
              </label>
            ) : null}

            {modalZone === 'header' ? (
              <>
                <label className="block text-xs font-medium text-muted-foreground">
                  Secondary label (optional, mega trigger tab)
                  <input
                    value={form.secondaryLabel}
                    onChange={(e) => setForm((f) => ({ ...f, secondaryLabel: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.openMegaMenu}
                    onChange={(e) => setForm((f) => ({ ...f, openMegaMenu: e.target.checked }))}
                  />
                  Opens mega menu panel (layered navigation below)
                </label>
              </>
            ) : (
              <label className="block text-xs font-medium text-muted-foreground">
                Parent item
                <select
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                >
                  <option value="">— Top level (column) —</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block text-xs font-medium text-muted-foreground">
              Sort order
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

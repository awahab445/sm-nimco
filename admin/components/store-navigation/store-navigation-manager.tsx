'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchStorefrontNavigation,
  createStorefrontNavItem,
  updateStorefrontNavItem,
  deleteStorefrontNavItem,
  type StorefrontNavRow,
  type StorefrontNavKind,
} from '@/lib/api/storefront-navigation';
import { formatApiError } from '@/lib/api/error-message';

export function StoreNavigationManager() {
  const [rows, setRows] = useState<StorefrontNavRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<StorefrontNavRow | null>(null);
  const [label, setLabel] = useState('');
  const [secondaryLabel, setSecondaryLabel] = useState('');
  const [href, setHref] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [kind, setKind] = useState<StorefrontNavKind>('LINK');
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setRows(await fetchStorefrontNavigation());
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

  function openCreate() {
    setEditing(null);
    setLabel('');
    setSecondaryLabel('');
    setHref('/');
    setSortOrder(String((rows[rows.length - 1]?.sortOrder ?? 0) + 10));
    setIsActive(true);
    setKind('LINK');
    setFormErr(null);
    setModal(true);
  }

  function openEdit(row: StorefrontNavRow) {
    setEditing(row);
    setLabel(row.label);
    setSecondaryLabel(row.secondaryLabel ?? '');
    setHref(row.href);
    setSortOrder(String(row.sortOrder));
    setIsActive(row.isActive);
    setKind(row.kind);
    setFormErr(null);
    setModal(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    setSaving(true);
    try {
      const sort = Math.max(0, parseInt(sortOrder, 10) || 0);
      const sec = secondaryLabel.trim() || null;
      if (editing) {
        await updateStorefrontNavItem(editing.id, {
          label: label.trim(),
          secondaryLabel: sec,
          href: href.trim(),
          sortOrder: sort,
          isActive,
          kind,
        });
      } else {
        await createStorefrontNavItem({
          label: label.trim(),
          secondaryLabel: sec,
          href: href.trim(),
          sortOrder: sort,
          isActive,
          kind,
        });
      }
      setModal(false);
      await load();
    } catch (err) {
      setFormErr(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: StorefrontNavRow) {
    if (!window.confirm(`Remove “${row.label}” from the storefront header?`)) return;
    setError(null);
    try {
      await deleteStorefrontNavItem(row.id);
      await load();
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  const megaCount = rows.filter((r) => r.kind === 'MEGA_CATEGORIES' && r.isActive).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Store navigation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Controls the storefront header links (Home, Shop mega menu, Cart, etc.). Use{' '}
          <strong>MEGA_CATEGORIES</strong> for at most one row: it shows the category mega menu with the primary
          label linking to <code className="rounded bg-muted px-1">href</code> and an optional second tab label.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {megaCount > 1 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          More than one active <strong>MEGA_CATEGORIES</strong> row — the API may reject updates. Keep a single active
          mega row.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
        >
          Add link
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {row.label}
                  {row.secondaryLabel ? (
                    <span className="text-muted-foreground"> · {row.secondaryLabel}</span>
                  ) : null}
                  {!row.isActive ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">(inactive)</span>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                  {row.href} · sort {row.sortOrder} · {row.kind}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(row)}
                  className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal>
          <form
            onSubmit={(e) => void submitForm(e)}
            className="w-full max-w-md space-y-4 rounded-xl border border-border bg-background p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">{editing ? 'Edit link' : 'New link'}</h2>
            {formErr && <p className="text-sm text-destructive">{formErr}</p>}
            <label className="block text-xs font-medium text-muted-foreground">
              Label
              <input
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Secondary label (mega menu second tab; optional)
              <input
                value={secondaryLabel}
                onChange={(e) => setSecondaryLabel(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                placeholder="Categories"
              />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              URL path
              <input
                required
                value={href}
                onChange={(e) => setHref(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-mono"
                placeholder="/products"
              />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Sort order
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Kind
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as StorefrontNavKind)}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              >
                <option value="LINK">LINK — normal nav link</option>
                <option value="MEGA_CATEGORIES">MEGA_CATEGORIES — opens category mega menu</option>
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
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
      )}
    </div>
  );
}

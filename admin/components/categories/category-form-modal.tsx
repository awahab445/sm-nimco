'use client';

import { adminUi } from '@/lib/admin-ui';
import { useEffect, useMemo, useState } from 'react';
import type { AdminCategoryListItem } from '@/lib/api/categories';
import {
  createAdminCategory,
  updateAdminCategory,
  type CreateCategoryBody,
  type UpdateCategoryBody,
} from '@/lib/api/categories';
import { formatApiError } from '@/lib/api/error-message';

function descendantIds(flat: AdminCategoryListItem[], rootId: string): Set<string> {
  const byParent = new Map<string, string[]>();
  for (const c of flat) {
    const key = c.parentId ?? '__root__';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c.id);
  }
  const out = new Set<string>();
  const stack = [...(byParent.get(rootId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    out.add(id);
    for (const ch of byParent.get(id) ?? []) stack.push(ch);
  }
  return out;
}

type Mode = 'create' | 'edit';

type CategoryFormModalProps = {
  open: boolean;
  mode: Mode;
  /** When editing, the row being edited */
  editing: AdminCategoryListItem | null;
  categories: AdminCategoryListItem[];
  onClose: () => void;
  onSaved: () => void;
};

export function CategoryFormModal({
  open,
  mode,
  editing,
  categories,
  onClose,
  onSaved,
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [position, setPosition] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const excludedParentIds = useMemo(() => {
    if (mode !== 'edit' || !editing) return new Set<string>();
    const d = descendantIds(categories, editing.id);
    d.add(editing.id);
    return d;
  }, [mode, editing, categories]);

  const parentOptions = useMemo(() => {
    return categories
      .filter((c) => !excludedParentIds.has(c.id))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, excludedParentIds]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === 'edit' && editing) {
      setName(editing.name);
      setSlug(editing.slug);
      setDescription(editing.description ?? '');
      setParentId(editing.parentId ?? '');
      setPosition(String(editing.position));
      setIsActive(editing.isActive);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setParentId('');
      setPosition('0');
      setIsActive(true);
    }
  }, [open, mode, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const pos = Math.max(0, parseInt(position, 10) || 0);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const body: CreateCategoryBody = {
          name: trimmedName,
          position: pos,
          ...(slug.trim() ? { slug: slug.trim() } : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(parentId ? { parentId } : {}),
        };
        await createAdminCategory(body);
      } else if (editing) {
        const slugOut = slug.trim() || editing.slug;
        const body: UpdateCategoryBody = {
          name: trimmedName,
          slug: slugOut,
          description: description.trim(),
          position: pos,
          isActive,
          parentId: parentId ? parentId : null,
        };
        await updateAdminCategory(editing.id, body);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={() => !submitting && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2
          id="category-form-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {mode === 'create' ? 'New category' : 'Edit category'}
        </h2>

        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="cat-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="cat-slug" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Slug
            </label>
            <input
              id="cat-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Leave blank to auto-generate from name"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="cat-desc" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label htmlFor="cat-parent" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Parent category
            </label>
            <select
              id="cat-parent"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="">— None (top level) —</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cat-pos" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Sort position
            </label>
            <input
              id="cat-pos"
              type="number"
              min={0}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {mode === 'edit' ? (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
              />
              Active (visible on storefront when parent chain is active)
            </label>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={adminUi.btnPrimary}
            >
              {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

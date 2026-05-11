'use client';

import { useMemo } from 'react';
import type { AdminPermission } from '@/lib/api/admin-roles';

type Props = {
  catalog: AdminPermission[];
  selectedKeys: Set<string>;
  onToggle: (key: string) => void;
  onSetAll: (keys: string[]) => void;
  disabled?: boolean;
  /**
   * Optional set of keys that are pending creation in `admin_permissions`
   * (i.e. they came from the role form's "Add custom permission" section,
   * not from the fetched catalog). Marked visually so the user knows they
   * will be minted on save.
   */
  newKeys?: Set<string>;
  /**
   * If provided, each row renders a small × button that calls this with the
   * permission key. The parent decides whether the delete is local (for staged
   * `newKeys`) or a real API delete (for catalog rows). Surface only when the
   * current user has authority to wipe permissions from the catalog
   * (typically: super-admin).
   */
  onDelete?: (key: string) => void | Promise<void>;
  /** Key currently being deleted (button shows spinner / disabled). */
  deletingKey?: string | null;
};

/**
 * Groups permission keys by the first segment of their dotted key
 * (e.g. `products.*`, `orders.*`) and renders a checkbox grid with bulk
 * select/clear per group.
 */
export function PermissionPicker({
  catalog,
  selectedKeys,
  onToggle,
  onSetAll,
  disabled,
  newKeys,
  onDelete,
  deletingKey,
}: Props) {
  const groups = useMemo(() => {
    const byGroup = new Map<string, AdminPermission[]>();
    for (const p of catalog) {
      const dotIdx = p.key.indexOf('.');
      const group = dotIdx === -1 ? p.key : p.key.slice(0, dotIdx);
      const arr = byGroup.get(group);
      if (arr) arr.push(p);
      else byGroup.set(group, [p]);
    }
    return Array.from(byGroup.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, items]) => ({
        group,
        items: items.slice().sort((a, b) => a.key.localeCompare(b.key)),
      }));
  }, [catalog]);

  return (
    <div className="space-y-3">
      {groups.map(({ group, items }) => {
        const groupKeys = items.map((i) => i.key);
        const allSelected = groupKeys.every((k) => selectedKeys.has(k));
        const someSelected = !allSelected && groupKeys.some((k) => selectedKeys.has(k));

        return (
          <fieldset
            key={group}
            className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <legend className="flex items-center gap-2 px-1">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {group}
              </span>
              <span className="text-xs text-zinc-500">
                ({groupKeys.filter((k) => selectedKeys.has(k)).length}/{groupKeys.length})
              </span>
              {disabled ? null : (
                <>
                  <button
                    type="button"
                    className="text-xs text-zinc-600 underline dark:text-zinc-400"
                    onClick={() => {
                      const next = new Set(selectedKeys);
                      if (allSelected) {
                        for (const k of groupKeys) next.delete(k);
                      } else {
                        for (const k of groupKeys) next.add(k);
                      }
                      onSetAll(Array.from(next));
                    }}
                  >
                    {allSelected ? 'Clear group' : someSelected ? 'Select rest' : 'Select all'}
                  </button>
                </>
              )}
            </legend>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {items.map((p) => {
                const isPending = !!newKeys?.has(p.key);
                const isDeleting = deletingKey === p.key;
                return (
                  <li key={p.key} className="flex items-start gap-2">
                    <input
                      id={`perm-${p.key}`}
                      type="checkbox"
                      checked={selectedKeys.has(p.key)}
                      onChange={() => onToggle(p.key)}
                      disabled={disabled || isDeleting}
                      className="mt-1 h-4 w-4 rounded border-zinc-300 disabled:opacity-50"
                    />
                    <label
                      htmlFor={`perm-${p.key}`}
                      className="flex-1 cursor-pointer text-xs"
                    >
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {p.key}
                      </span>
                      {isPending ? (
                        <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                          new
                        </span>
                      ) : null}
                      {p.description ? (
                        <span className="ml-1 text-zinc-500">— {p.description}</span>
                      ) : null}
                      {typeof p.roleCount === 'number' && !isPending ? (
                        <span className="ml-1 text-[10px] text-zinc-400">
                          (in {p.roleCount} role{p.roleCount === 1 ? '' : 's'})
                        </span>
                      ) : null}
                    </label>
                    {onDelete ? (
                      <button
                        type="button"
                        onClick={() => void onDelete(p.key)}
                        disabled={isDeleting}
                        title={
                          isPending
                            ? 'Remove from this draft (no save yet)'
                            : 'Delete this permission from the catalog (affects every role)'
                        }
                        className="mt-0.5 rounded-md border border-transparent px-1 text-xs text-zinc-400 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-40 dark:hover:border-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                        aria-label={`Delete permission ${p.key}`}
                      >
                        {isDeleting ? '…' : '×'}
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </fieldset>
        );
      })}
    </div>
  );
}

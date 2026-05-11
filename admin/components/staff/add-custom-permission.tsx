'use client';

import { useMemo, useState } from 'react';
import type { NewPermissionInput } from '@/lib/api/admin-roles';

/**
 * An "area" is the entity slug part of a permission key, e.g. `warehouse` in
 * `warehouse.scan`, or `admin.users` in `admin.users.create`. We allow letters,
 * digits, dots and dashes so multi-segment areas like `admin.users` keep working.
 */
const AREA_PATTERN = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

const ACTION_OPTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const;
type Action = (typeof ACTION_OPTIONS)[number];

const ACTION_HINTS: Record<Action, string | null> = {
  create: null,
  read: null,
  update: null,
  delete: null,
  manage: 'full bundle',
};

type Props = {
  /** Keys already in the catalog OR staged for creation — used to reject duplicates. */
  existingKeys: ReadonlyArray<string>;
  /**
   * Suggested area names (entity prefixes) from the current catalog. Surfaced
   * via a `<datalist>` so the user can autocomplete to existing entities but
   * still type something new.
   */
  suggestedAreas?: ReadonlyArray<string>;
  /** Called with one entry per ticked action when the user clicks Add. */
  onAdd: (entries: NewPermissionInput[]) => void;
  disabled?: boolean;
};

/**
 * Inline mini-form for granting "an area of permission" to a role. The user
 * picks an area name (entity slug) and ticks the actions they want. Saving
 * emits one `NewPermissionInput` per ticked action; the parent form sends
 * them in `newPermissions[]` on submit, where the backend upserts them into
 * `admin_permissions` and grants them to the role.
 */
export function AddCustomPermission({
  existingKeys,
  suggestedAreas,
  onAdd,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState('');
  const [actions, setActions] = useState<Set<Action>>(
    () => new Set<Action>(['create', 'read', 'update', 'delete']),
  );
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const datalistId = 'custom-permission-area-suggestions';

  function reset() {
    setArea('');
    setActions(new Set<Action>(['create', 'read', 'update', 'delete']));
    setDescription('');
    setError(null);
  }

  function toggleAction(action: Action) {
    setActions((prev) => {
      const next = new Set(prev);
      if (next.has(action)) next.delete(action);
      else next.add(action);
      return next;
    });
    setError(null);
  }

  const normalizedArea = area.trim().toLowerCase();
  const selectedActions = useMemo(
    () => ACTION_OPTIONS.filter((a) => actions.has(a)),
    [actions],
  );

  /** Live preview: what keys will be minted if the user clicks Add right now. */
  const previewKeys = useMemo(() => {
    if (!normalizedArea || !AREA_PATTERN.test(normalizedArea)) return [];
    return selectedActions.map((a) => `${normalizedArea}.${a}`);
  }, [normalizedArea, selectedActions]);

  function handleAdd() {
    if (!normalizedArea) {
      setError('Area is required.');
      return;
    }
    if (!AREA_PATTERN.test(normalizedArea)) {
      setError(
        'Area must be lowercase letters, digits, dots, or dashes. Example: warehouse',
      );
      return;
    }
    if (selectedActions.length === 0) {
      setError('Pick at least one action to grant.');
      return;
    }

    const existing = new Set(existingKeys);
    const newEntries: NewPermissionInput[] = [];
    const skipped: string[] = [];

    for (const action of selectedActions) {
      const key = `${normalizedArea}.${action}`;
      if (existing.has(key)) {
        skipped.push(key);
        continue;
      }
      newEntries.push({
        key,
        description: description.trim() || undefined,
      });
    }

    if (newEntries.length === 0) {
      setError(
        skipped.length
          ? `All selected keys already exist: ${skipped.join(', ')}`
          : 'Nothing to add.',
      );
      return;
    }

    onAdd(newEntries);
    reset();
  }

  if (disabled) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        + Add area of permission
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
        Add an area of permission
      </p>
      <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
        Pick an area (e.g. <span className="font-mono">warehouse</span>) and tick which actions
        to grant. One permission row is created per ticked action and granted to this role on
        save.
      </p>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            Area *
          </label>
          <input
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setError(null);
            }}
            list={suggestedAreas && suggestedAreas.length > 0 ? datalistId : undefined}
            placeholder="warehouse"
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900"
          />
          {suggestedAreas && suggestedAreas.length > 0 ? (
            <datalist id={datalistId}>
              {suggestedAreas.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          ) : null}
          <p className="mt-1 text-[10px] text-zinc-500">
            Lowercase letters, digits, dots, dashes. Start typing to autocomplete existing areas.
          </p>
        </div>
        <div>
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            Description (optional, shared across actions)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Warehouse barcode scanning"
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="mt-2">
        <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Actions *</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {ACTION_OPTIONS.map((action) => {
            const hint = ACTION_HINTS[action];
            return (
              <label
                key={action}
                className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] dark:border-zinc-700 dark:bg-zinc-950"
              >
                <input
                  type="checkbox"
                  checked={actions.has(action)}
                  onChange={() => toggleAction(action)}
                  className="h-3.5 w-3.5"
                />
                <span className="font-mono">{action}</span>
                {hint ? <span className="text-zinc-500">— {hint}</span> : null}
              </label>
            );
          })}
        </div>
      </div>

      {previewKeys.length > 0 ? (
        <div className="mt-2 rounded-md bg-white/60 px-2 py-1 dark:bg-zinc-950/60">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">
            Will create ({previewKeys.length})
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
            {previewKeys.join(', ')}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-[11px] text-red-700 dark:text-red-300">{error}</p>
      ) : null}

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
        >
          Add to role
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium dark:border-zinc-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

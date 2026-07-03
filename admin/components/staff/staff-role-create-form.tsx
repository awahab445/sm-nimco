'use client';

import { adminUi } from '@/lib/admin-ui';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createAdminRole,
  deleteAdminPermission,
  fetchAdminPermissionCatalog,
  type AdminPermission,
  type NewPermissionInput,
} from '@/lib/api/admin-roles';
import { formatApiError } from '@/lib/api/error-message';
import { usePermissions } from '@/lib/use-permissions';
import { NoAccessPanel } from '@/components/permission-gate';
import { PermissionPicker } from './permission-picker';
import { AddCustomPermission } from './add-custom-permission';

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function StaffRoleCreateForm() {
  const router = useRouter();
  const { ready, can, isSuperAdmin } = usePermissions();
  const canManage = can('admin.roles', 'manage');

  const [catalog, setCatalog] = useState<AdminPermission[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Locally-staged new permission keys (not yet saved). Sent to the API as
  // `newPermissions` on submit; merged into `catalog` for display so they
  // appear in the picker alongside seeded keys.
  const [newPerms, setNewPerms] = useState<NewPermissionInput[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !canManage) {
      setLoadingCatalog(false);
      return;
    }
    setLoadingCatalog(true);
    fetchAdminPermissionCatalog()
      .then(setCatalog)
      .catch((e) => setCatalogError(formatApiError(e)))
      .finally(() => setLoadingCatalog(false));
  }, [ready, canManage]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  // Display catalog = seeded catalog + staged-new (so picker shows them).
  const displayCatalog = useMemo<AdminPermission[]>(() => {
    const seen = new Set(catalog.map((p) => p.key));
    const staged: AdminPermission[] = newPerms
      .filter((p) => !seen.has(p.key))
      .map((p) => ({
        id: `__new__${p.key}`,
        key: p.key,
        description: p.description ?? null,
      }));
    return [...catalog, ...staged];
  }, [catalog, newPerms]);

  const newKeySet = useMemo(() => new Set(newPerms.map((p) => p.key)), [newPerms]);
  const existingKeys = useMemo(
    () => [...catalog.map((p) => p.key), ...newPerms.map((p) => p.key)],
    [catalog, newPerms],
  );

  /**
   * Distinct entity prefixes already in the catalog, used to populate the
   * "Area" datalist so the user can autocomplete to `products`, `orders`,
   * `admin.users`, etc. We strip the trailing `.action` segment.
   */
  const suggestedAreas = useMemo(() => {
    const set = new Set<string>();
    for (const p of catalog) {
      const idx = p.key.lastIndexOf('.');
      if (idx > 0) set.add(p.key.slice(0, idx));
    }
    return Array.from(set).sort();
  }, [catalog]);

  function toggleKey(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleAddNewPerms(entries: NewPermissionInput[]) {
    if (entries.length === 0) return;
    setNewPerms((prev) => {
      const have = new Set(prev.map((p) => p.key));
      const additions = entries.filter((e) => !have.has(e.key));
      return [...prev, ...additions];
    });
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const e of entries) next.add(e.key);
      return next;
    });
  }

  function handleRemoveNewPerm(key: string) {
    setNewPerms((prev) => prev.filter((p) => p.key !== key));
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  /**
   * Delete a permission from the catalog (only available to super-admins).
   * For staged-new keys we just drop them locally — they don't exist server-
   * side yet. For real catalog keys we call the API, then prune local state.
   */
  async function handleDeletePerm(key: string) {
    setError(null);

    // Staged new perm: no server delete needed.
    if (newPerms.some((p) => p.key === key)) {
      handleRemoveNewPerm(key);
      return;
    }

    const meta = catalog.find((p) => p.key === key);
    const roleCount = meta?.roleCount ?? 0;

    const msg =
      `Delete permission "${key}" from the catalog?\n\n` +
      (roleCount > 0
        ? `It is currently granted to ${roleCount} role(s); they will all lose it.\n\n`
        : '') +
      `This cannot be undone (without re-creating the key).`;

    if (!window.confirm(msg)) return;

    setDeletingKey(key);
    try {
      await deleteAdminPermission(key);
      setCatalog((prev) => prev.filter((p) => p.key !== key));
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setDeletingKey(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!SLUG_PATTERN.test(slug)) {
      setError('Slug must be lowercase letters, digits, and dashes (e.g. "warehouse-ops").');
      return;
    }

    // Separate selected keys into "existing" (sent as permissionKeys) and
    // "new" (sent as newPermissions). The backend dedupes the union.
    const seededKeySet = new Set(catalog.map((p) => p.key));
    const permissionKeys = Array.from(selectedKeys).filter((k) => seededKeySet.has(k));
    const newPermissions = newPerms.filter((p) => selectedKeys.has(p.key));

    setSaving(true);
    try {
      const created = await createAdminRole({
        slug,
        name: name.trim(),
        description: description.trim() || undefined,
        permissionKeys,
        newPermissions: newPermissions.length ? newPermissions : undefined,
      });
      router.push(`/staff/roles/${created.id}`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  // Conditional render comes *after* all hooks are declared so hook order
  // stays stable across renders (Rules of Hooks).
  if (ready && !canManage) {
    return <NoAccessPanel requiredKeys={['admin.roles.manage']} />;
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
    >
      <Link href="/staff/roles" className="text-sm text-zinc-600 underline dark:text-zinc-400">
        ← Roles
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New role</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Custom roles are non-system: you can edit or delete them later. Requires{' '}
        <span className="font-mono text-xs">admin.roles.manage</span>.
      </p>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Warehouse Operations"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Slug *</label>
          <input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="warehouse-ops"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
          <p className="mt-1 text-[11px] text-zinc-500">Lowercase letters, digits, and dashes.</p>
        </div>
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

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Permissions</h2>
          <span className="text-xs text-zinc-500">{selectedKeys.size} selected</span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          Tick any permissions to grant to this role. To add a whole new <em>area</em> of
          permissions (e.g. <span className="font-mono">warehouse</span>) and the CRUD actions
          for it, use the section below — each ticked action becomes its own row, marked{' '}
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
            new
          </span>{' '}
          in the picker.
        </p>

        {catalogError ? (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {catalogError}
          </p>
        ) : loadingCatalog ? (
          <p className="mt-2 text-sm text-zinc-500">Loading permission catalog…</p>
        ) : (
          <div className="mt-2 space-y-3">
            <PermissionPicker
              catalog={displayCatalog}
              selectedKeys={selectedKeys}
              onToggle={toggleKey}
              onSetAll={(keys) => setSelectedKeys(new Set(keys))}
              newKeys={newKeySet}
              onDelete={isSuperAdmin ? handleDeletePerm : undefined}
              deletingKey={deletingKey}
            />

            {newPerms.length > 0 ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  Pending new permissions ({newPerms.length})
                </p>
                <ul className="mt-1 space-y-1">
                  {newPerms.map((p) => (
                    <li
                      key={p.key}
                      className="flex items-center justify-between gap-2 text-[11px]"
                    >
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {p.key}
                        {p.description ? (
                          <span className="ml-1 text-zinc-500">— {p.description}</span>
                        ) : null}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewPerm(p.key)}
                        className="rounded-md border border-zinc-300 px-2 py-0.5 text-[10px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <AddCustomPermission
              existingKeys={existingKeys}
              suggestedAreas={suggestedAreas}
              onAdd={handleAddNewPerms}
            />
          </div>
        )}
      </section>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || loadingCatalog}
          className={adminUi.btnPrimary}
        >
          {saving ? 'Creating…' : 'Create role'}
        </button>
        <Link
          href="/staff/roles"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

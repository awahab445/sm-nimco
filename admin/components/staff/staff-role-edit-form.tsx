'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  deleteAdminPermission,
  deleteAdminRole,
  fetchAdminPermissionCatalog,
  fetchAdminRole,
  updateAdminRole,
  type AdminPermission,
  type AdminRole,
  type NewPermissionInput,
} from '@/lib/api/admin-roles';
import { formatApiError } from '@/lib/api/error-message';
import { usePermissions } from '@/lib/use-permissions';
import { NoAccessPanel } from '@/components/permission-gate';
import { PermissionPicker } from './permission-picker';
import { AddCustomPermission } from './add-custom-permission';

export function StaffRoleEditForm({ roleId }: { roleId: string }) {
  const router = useRouter();
  const { ready, can, isSuperAdmin } = usePermissions();
  const canRead = can('admin.roles', 'read');
  const canManage = can('admin.roles', 'manage');

  const [role, setRole] = useState<AdminRole | null>(null);
  const [catalog, setCatalog] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Locally-staged new permission keys to be minted on save.
  const [newPerms, setNewPerms] = useState<NewPermissionInput[]>([]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingPermKey, setDeletingPermKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isSuper = role?.slug === 'super-admin';
  const isSystem = role?.isSystem ?? false;

  useEffect(() => {
    if (!ready) return;
    if (!canRead) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchAdminRole(roleId), fetchAdminPermissionCatalog()])
      .then(([r, perms]) => {
        if (cancelled) return;
        setRole(r);
        setCatalog(perms);
        setName(r.name);
        setDescription(r.description ?? '');
        setSelectedKeys(new Set(r.permissions.map((p) => p.permission.key)));
        setLoadError(null);
      })
      .catch((e) => !cancelled && setLoadError(formatApiError(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [roleId, ready, canRead]);

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

  /** Distinct entity prefixes derived from the current catalog (for the area datalist). */
  const suggestedAreas = useMemo(() => {
    const set = new Set<string>();
    for (const p of catalog) {
      const idx = p.key.lastIndexOf('.');
      if (idx > 0) set.add(p.key.slice(0, idx));
    }
    return Array.from(set).sort();
  }, [catalog]);

  if (ready && !canRead) {
    return <NoAccessPanel requiredKeys={['admin.roles.read']} />;
  }

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
   * Delete a permission from the catalog (super-admin only). Staged-new keys
   * drop locally; real catalog keys hit the API and we then prune local state
   * so the picker reflects the new world.
   */
  async function handleDeletePerm(key: string) {
    setError(null);
    setInfo(null);

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

    setDeletingPermKey(key);
    try {
      const result = await deleteAdminPermission(key);
      setCatalog((prev) => prev.filter((p) => p.key !== key));
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setInfo(
        `Deleted "${key}". Removed from ${result.roleLinksRemoved} role grant(s).`,
      );
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setDeletingPermKey(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setError(null);
    setInfo(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Split the selected set into existing (sent as permissionKeys) and
    // freshly-minted (sent as newPermissions). Backend dedupes the union.
    const seededKeySet = new Set(catalog.map((p) => p.key));
    const permissionKeys = Array.from(selectedKeys).filter((k) => seededKeySet.has(k));
    const newPermissions = newPerms.filter((p) => selectedKeys.has(p.key));

    setSaving(true);
    try {
      const updated = await updateAdminRole(roleId, {
        name: name.trim(),
        description: description.trim(),
        // Super-admin's permission set is seed-managed; never send keys for it.
        ...(isSuper
          ? {}
          : {
              permissionKeys,
              ...(newPermissions.length ? { newPermissions } : {}),
            }),
      });
      setRole(updated);
      // Move any keys that were just minted out of `newPerms` and into the
      // canonical catalog so they no longer show the "new" badge.
      if (newPermissions.length) {
        const mintedKeys = new Set(newPermissions.map((p) => p.key));
        setNewPerms((prev) => prev.filter((p) => !mintedKeys.has(p.key)));
        setCatalog((prev) => {
          const have = new Set(prev.map((p) => p.key));
          const added: AdminPermission[] = newPermissions
            .filter((p) => !have.has(p.key))
            .map((p) => ({
              id: `__pending__${p.key}`,
              key: p.key,
              description: p.description ?? null,
            }));
          return [...prev, ...added];
        });
      }
      setInfo('Saved.');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!role) return;

    let msg: string;
    if (role.slug === 'super-admin') {
      msg =
        `DESTRUCTIVE: delete the SUPER-ADMIN role "${role.name}"?\n\n` +
        `Every user currently holding super-admin will lose privileged access ` +
        `on their next request — INCLUDING YOU.\n\n` +
        `You can run "npx prisma db seed" later to recreate the role, but you ` +
        `will need direct DB access to re-link your own user to it.\n\n` +
        `Type OK only if you really mean it.`;
    } else if (role.isSystem) {
      msg =
        `Delete system role "${role.name}" (${role.slug})?\n\n` +
        `This is permanent. Any users currently holding this role will lose ` +
        `whatever permissions it granted. The seed can recreate this role ` +
        `with its default permission set, but you will need to re-assign it ` +
        `to users.`;
    } else {
      msg = `Delete role "${role.name}" (${role.slug})? This cannot be undone.`;
    }

    const ok = window.confirm(msg);
    if (!ok) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAdminRole(roleId);
      router.push('/staff/roles?deleted=1');
    } catch (err) {
      setError(formatApiError(err));
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }
  if (loadError || !role) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {loadError ?? 'Role not found.'}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSave(e)}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
    >
      <Link href="/staff/roles" className="text-sm text-zinc-600 underline dark:text-zinc-400">
        ← Roles
      </Link>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {role.name}
            {isSystem ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                system
              </span>
            ) : null}
          </h1>
          <p className="mt-0.5 font-mono text-xs text-zinc-500">{role.slug}</p>
          {isSuper ? (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              The super-admin role grants every permission. Permissions are managed by the seed and
              cannot be edited here.
            </p>
          ) : null}
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={(isSystem && !isSuperAdmin) || deleting}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40"
            title={
              isSystem
                ? isSuperAdmin
                  ? 'Delete system role (super-admin override). The seed can recreate it later.'
                  : 'System roles can only be deleted by a super-admin.'
                : 'Delete role'
            }
          >
            {deleting ? 'Deleting…' : 'Delete role'}
          </button>
        ) : null}
      </header>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {info}
        </p>
      ) : null}

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

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Permissions</h2>
          <span className="text-xs text-zinc-500">{selectedKeys.size} selected</span>
        </div>
        {!isSuper ? (
          <p className="mt-1 text-[11px] text-zinc-500">
            Tick any permissions to grant. Need a whole new <em>area</em>? Use the section
            below to add an area (e.g. <span className="font-mono">warehouse</span>) and pick
            which CRUD actions to mint — each becomes its own row tagged{' '}
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
              new
            </span>{' '}
            in the picker.
          </p>
        ) : null}
        <div className="mt-2 space-y-3">
          <PermissionPicker
            catalog={displayCatalog}
            selectedKeys={selectedKeys}
            onToggle={toggleKey}
            onSetAll={(keys) => setSelectedKeys(new Set(keys))}
            disabled={isSuper || !canManage}
            newKeys={newKeySet}
            onDelete={isSuperAdmin && !isSuper ? handleDeletePerm : undefined}
            deletingKey={deletingPermKey}
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

          {canManage && !isSuper ? (
            <AddCustomPermission
              existingKeys={existingKeys}
              suggestedAreas={suggestedAreas}
              onAdd={handleAddNewPerms}
            />
          ) : null}
        </div>
      </section>

      <div className="flex gap-2">
        {canManage ? (
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        ) : (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            Read-only — you do not have <span className="font-mono">admin.roles.manage</span>.
          </p>
        )}
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

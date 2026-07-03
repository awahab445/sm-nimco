'use client';

import { adminUi } from '@/lib/admin-ui';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAdminRoles, type AdminRole } from '@/lib/api/admin-roles';
import {
  deleteStaffUser,
  fetchStaffUser,
  updateStaffUser,
  type StaffUser,
} from '@/lib/api/admin-users';
import { formatApiError } from '@/lib/api/error-message';
import { useAuthStore } from '@/lib/auth.store';
import { usePermissions } from '@/lib/use-permissions';
import { NoAccessPanel } from '@/components/permission-gate';

const PASSWORD_MIN = 8;

export function StaffUserEditForm({ userId }: { userId: string }) {
  const router = useRouter();
  const me = useAuthStore((s) => s.user);
  const { ready, can } = usePermissions();
  const canRead = can('admin.users', 'read');
  const canUpdate = can('admin.users', 'update');
  const canDelete = can('admin.users', 'delete');

  const [user, setUser] = useState<StaffUser | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isSelf = me?.id === userId;

  useEffect(() => {
    if (!ready) return;
    if (!canRead) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchStaffUser(userId), fetchAdminRoles()])
      .then(([u, rs]) => {
        if (cancelled) return;
        setUser(u);
        setRoles(rs);
        setFirstName(u.firstName ?? '');
        setLastName(u.lastName ?? '');
        setIsActive(u.isActive);
        setSelectedRoleIds(new Set(u.roles.map((r) => r.id)));
        setLoadError(null);
      })
      .catch((e) => !cancelled && setLoadError(formatApiError(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId, ready, canRead]);

  if (ready && !canRead) {
    return <NoAccessPanel requiredKeys={['admin.users.read']} />;
  }

  const sortedRoles = useMemo(
    () => roles.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [roles],
  );

  function toggleRole(id: string) {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (selectedRoleIds.size === 0) {
      setError('Select at least one role');
      return;
    }
    if (newPassword) {
      if (newPassword.length < PASSWORD_MIN) {
        setError(`Password must be at least ${PASSWORD_MIN} characters`);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await updateStaffUser(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isActive,
        ...(newPassword ? { password: newPassword } : {}),
        roleIds: Array.from(selectedRoleIds),
      });
      setUser(updated);
      setNewPassword('');
      setConfirmPassword('');
      setInfo('Saved.');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    const ok = window.confirm(
      `Delete admin user "${user.email}"? This permanently removes the account and their role assignments.`,
    );
    if (!ok) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteStaffUser(userId);
      router.push('/staff/users?deleted=1');
    } catch (err) {
      setError(formatApiError(err));
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }
  if (loadError || !user) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {loadError ?? 'Admin user not found.'}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSave(e)}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
    >
      <Link href="/staff/users" className="text-sm text-zinc-600 underline dark:text-zinc-400">
        ← Admin users
      </Link>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {user.email}
          </h1>
          <p className="mt-0.5 font-mono text-xs text-zinc-500">{user.id}</p>
          {isSelf ? (
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
              This is your own account. You cannot deactivate or delete it.
            </p>
          ) : null}
        </div>
        {canDelete ? (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isSelf || deleting}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40"
            title={isSelf ? 'You cannot delete your own account' : 'Delete admin user'}
          >
            {deleting ? 'Deleting…' : 'Delete user'}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">First name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Last name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
      </div>

      <label
        className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200"
        title={isSelf ? 'You cannot deactivate your own account' : undefined}
      >
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          disabled={isSelf}
          className="h-4 w-4 rounded border-zinc-300 disabled:opacity-50"
        />
        Active (allowed to log in)
      </label>

      <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <legend className="px-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Reset password (optional)
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={`New password (min ${PASSWORD_MIN} chars)`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Show passwords
        </label>
        <p className="text-xs text-zinc-500">
          Leave blank to keep the existing password.
        </p>
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Roles *</label>
          <Link
            href="/staff/roles"
            className="text-xs text-zinc-600 underline dark:text-zinc-400"
          >
            View role permissions
          </Link>
        </div>
        <ul className="mt-2 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {sortedRoles.map((r) => (
            <li key={r.id} className="flex items-start gap-3 px-3 py-3">
              <input
                id={`role-${r.id}`}
                type="checkbox"
                checked={selectedRoleIds.has(r.id)}
                onChange={() => toggleRole(r.id)}
                className="mt-1 h-4 w-4 rounded border-zinc-300"
              />
              <label htmlFor={`role-${r.id}`} className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {r.name}
                  <span className="font-mono text-xs text-zinc-500">{r.slug}</span>
                  {r.isSystem ? (
                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                      system
                    </span>
                  ) : null}
                </div>
                {r.description ? (
                  <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {r.description}
                  </p>
                ) : null}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        {canUpdate ? (
          <button
            type="submit"
            disabled={saving}
            className={adminUi.btnPrimary}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        ) : (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            Read-only — you do not have <span className="font-mono">admin.users.update</span>.
          </p>
        )}
        <Link
          href="/staff/users"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

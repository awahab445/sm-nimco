'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAdminRoles, type AdminRole } from '@/lib/api/admin-roles';
import { createStaffUser } from '@/lib/api/admin-users';
import { formatApiError } from '@/lib/api/error-message';
import { usePermissions } from '@/lib/use-permissions';
import { NoAccessPanel } from '@/components/permission-gate';

const PASSWORD_MIN = 8;

export function StaffUserCreateForm() {
  const router = useRouter();
  const { ready, can } = usePermissions();
  const canCreate = can('admin.users', 'create');
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !canCreate) {
      setLoadingRoles(false);
      return;
    }
    setLoadingRoles(true);
    fetchAdminRoles()
      .then((rs) => {
        setRoles(rs);
        setRolesError(null);
      })
      .catch((e) => setRolesError(formatApiError(e)))
      .finally(() => setLoadingRoles(false));
  }, [ready, canCreate]);

  if (ready && !canCreate) {
    return <NoAccessPanel requiredKeys={['admin.users.create']} />;
  }

  const sortedRoles = useMemo(
    () => roles.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [roles],
  );

  function toggleRole(id: string) {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (password.length < PASSWORD_MIN) {
      setError(`Password must be at least ${PASSWORD_MIN} characters`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (selectedRoleIds.size === 0) {
      setError('Select at least one role');
      return;
    }

    setSaving(true);
    try {
      const created = await createStaffUser({
        email: email.trim(),
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        roleIds: Array.from(selectedRoleIds),
      });
      router.push(`/staff/users?created=${encodeURIComponent(created.id)}`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
    >
      <Link href="/staff/users" className="text-sm text-zinc-600 underline dark:text-zinc-400">
        ← Admin users
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New admin user</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Creates a staff account, hashes the password with bcrypt, and assigns the selected roles.
        Requires <span className="font-mono text-xs">admin.users.create</span>.
      </p>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Email *</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Password * (min {PASSWORD_MIN} chars)
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Confirm password *
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300"
        />
        Show passwords
      </label>

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

        {rolesError ? (
          <p className="mt-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            Could not load roles: {rolesError}
          </p>
        ) : loadingRoles ? (
          <p className="mt-2 text-sm text-zinc-500">Loading roles…</p>
        ) : sortedRoles.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            No roles exist yet. Run <span className="font-mono text-xs">prisma db seed</span> on the
            backend.
          </p>
        ) : (
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
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {r.permissions.length} permission{r.permissions.length === 1 ? '' : 's'}
                  </p>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || loadingRoles}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? 'Creating…' : 'Create admin user'}
        </button>
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

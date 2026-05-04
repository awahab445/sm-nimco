'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchCustomerGroups, type CustomerGroup } from '@/lib/api/customer-groups';
import { fetchAdminCustomers, type Customer } from '@/lib/api/customers';
import { formatApiError } from '@/lib/api/error-message';

const PAGE_SIZE = 20;

type GuestFilter = 'all' | 'guest' | 'registered';

export function CustomersList() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [guestFilter, setGuestFilter] = useState<GuestFilter>('all');
  const [groupFilter, setGroupFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchAdminCustomers({
        search: search.trim() || undefined,
        ...(guestFilter === 'guest' ? { isGuest: true } : {}),
        ...(guestFilter === 'registered' ? { isGuest: false } : {}),
        ...(groupFilter ? { customerGroupId: groupFilter } : {}),
      });
      setRows(list);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [search, guestFilter, groupFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchCustomerGroups().then(setGroups).catch(() => setGroups([]));
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Customers
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Admin view of shoppers and guests. Filters call the API; pagination is client-side (
            {PAGE_SIZE} per page).
          </p>
        </div>
        <Link
          href="/customers/new"
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New customer
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Search</label>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Email, first or last name"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="w-full sm:w-44">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Account</label>
          <select
            value={guestFilter}
            onChange={(e) => {
              setGuestFilter(e.target.value as GuestFilter);
              setPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="all">All</option>
            <option value="guest">Guest only</option>
            <option value="registered">Registered only</option>
          </select>
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Group</label>
          <select
            value={groupFilter}
            onChange={(e) => {
              setGroupFilter(e.target.value);
              setPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">All groups</option>
            {groups
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                  {g.isDefault ? ' (default)' : ''}
                </option>
              ))}
          </select>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
        ) : pageRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No customers match.</div>
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Customer</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Group</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Type</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300 text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {pageRows.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                    </div>
                    <div className="font-mono text-xs text-zinc-500">{c.id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{c.email}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {c.customerGroup?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {c.isGuest ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                        Guest
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                        Registered
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/customers/${c.id}`}
                      className="font-medium text-zinc-900 underline dark:text-zinc-100"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rows.length > PAGE_SIZE ? (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            {rows.length} customers · Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

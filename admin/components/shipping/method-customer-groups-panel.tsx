'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchCustomerGroups, type CustomerGroup } from '@/lib/api/customer-groups';
import {
  assignMethodCustomerGroup,
  fetchMethodCustomerGroups,
  removeMethodCustomerGroup,
  updateMethodCustomerGroupPricing,
  type MethodCustomerGroupRow,
} from '@/lib/api/shipping';
import { formatApiError } from '@/lib/api/error-message';

export function MethodCustomerGroupsPanel({ methodId }: { methodId: string }) {
  const [rows, setRows] = useState<MethodCustomerGroupRow[]>([]);
  const [allGroups, setAllGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addGroupId, setAddGroupId] = useState('');
  const [addDiscount, setAddDiscount] = useState('');
  const [addFixed, setAddFixed] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDiscount, setEditDiscount] = useState('');
  const [editFixed, setEditFixed] = useState('');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchMethodCustomerGroups(methodId);
      setRows(list);
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [methodId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchCustomerGroups()
      .then(setAllGroups)
      .catch(() => setAllGroups([]));
  }, []);

  const assignedIds = new Set(rows.map((r) => r.customerGroupId));
  const availableGroups = allGroups.filter((g) => !assignedIds.has(g.id));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    if (!addGroupId) {
      setAddError('Pick a customer group.');
      return;
    }
    const discountPercent =
      addDiscount.trim() === '' ? undefined : Number(addDiscount);
    const fixedCost = addFixed.trim() === '' ? undefined : Number(addFixed);
    if (discountPercent !== undefined && Number.isNaN(discountPercent)) {
      setAddError('Discount must be a number.');
      return;
    }
    if (fixedCost !== undefined && Number.isNaN(fixedCost)) {
      setAddError('Fixed cost must be a number.');
      return;
    }
    setSaving(true);
    try {
      await assignMethodCustomerGroup(methodId, {
        customerGroupId: addGroupId,
        ...(discountPercent !== undefined ? { discountPercent } : {}),
        ...(fixedCost !== undefined ? { fixedCost } : {}),
      });
      setAddGroupId('');
      setAddDiscount('');
      setAddFixed('');
      await load();
    } catch (err) {
      setAddError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(row: MethodCustomerGroupRow) {
    const discountPercent =
      editDiscount.trim() === '' ? undefined : Number(editDiscount);
    const fixedCost = editFixed.trim() === '' ? undefined : Number(editFixed);
    setSaving(true);
    try {
      await updateMethodCustomerGroupPricing(methodId, row.customerGroupId, {
        ...(discountPercent !== undefined && !Number.isNaN(discountPercent)
          ? { discountPercent }
          : {}),
        ...(fixedCost !== undefined && !Number.isNaN(fixedCost) ? { fixedCost } : {}),
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(row: MethodCustomerGroupRow) {
    if (!window.confirm(`Remove group “${row.customerGroup.name}” from this method?`)) return;
    setSaving(true);
    try {
      await removeMethodCustomerGroup(methodId, row.customerGroupId);
      await load();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Customer group pricing
      </h2>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        Restrict or adjust shipping cost per segment. Eligibility rules follow the shipping service
        evaluator.
      </p>

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-zinc-500">Loading associations…</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Group</th>
                  <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Discount %</th>
                  <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Fixed cost</th>
                  <th className="px-3 py-2 text-right font-medium text-zinc-700 dark:text-zinc-300">
                    {' '}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {row.customerGroup.name}
                      </div>
                      <div className="font-mono text-xs text-zinc-500">{row.customerGroupId}</div>
                    </td>
                    <td className="px-3 py-2">
                      {editingId === row.id ? (
                        <input
                          value={editDiscount}
                          onChange={(e) => setEditDiscount(e.target.value)}
                          className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                          placeholder={row.discountPercent?.toString() ?? ''}
                        />
                      ) : (
                        row.discountPercent ?? '—'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === row.id ? (
                        <input
                          value={editFixed}
                          onChange={(e) => setEditFixed(e.target.value)}
                          className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                          placeholder={row.fixedCost?.toString() ?? ''}
                        />
                      ) : (
                        row.fixedCost ?? '—'
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {editingId === row.id ? (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void saveEdit(row)}
                            className="text-xs font-medium text-zinc-900 underline dark:text-zinc-100"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-xs text-zinc-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(row.id);
                              setEditDiscount(
                                row.discountPercent != null ? String(row.discountPercent) : '',
                              );
                              setEditFixed(row.fixedCost != null ? String(row.fixedCost) : '');
                            }}
                            className="text-xs font-medium text-zinc-900 underline dark:text-zinc-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRemove(row)}
                            className="text-xs font-medium text-red-600 dark:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleAdd} className="mt-6 flex flex-wrap items-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Add group
              </label>
              <select
                value={addGroupId}
                onChange={(e) => setAddGroupId(e.target.value)}
                className="mt-1 block rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Select…</option>
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Discount %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={addDiscount}
                onChange={(e) => setAddDiscount(e.target.value)}
                className="mt-1 w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Fixed cost
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={addFixed}
                onChange={(e) => setAddFixed(e.target.value)}
                className="mt-1 w-28 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <button
              type="submit"
              disabled={saving || availableGroups.length === 0}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Assign
            </button>
            {addError ? (
              <p className="w-full text-sm text-red-600 dark:text-red-400">{addError}</p>
            ) : null}
          </form>
        </>
      )}
    </section>
  );
}

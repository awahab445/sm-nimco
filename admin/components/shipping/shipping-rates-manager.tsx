'use client';

import { adminUi } from '@/lib/admin-ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  deleteShippingRate,
  downloadShippingRatesTemplate,
  fetchShippingRates,
  parseShippingRatesCsvPreview,
  updateShippingRate,
  uploadShippingRatesCsv,
  type ShippingRate,
} from '@/lib/api/shipping-rates';
import { formatApiError } from '@/lib/api/error-message';

export function ShippingRatesManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ShippingRate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState('');
  const [editCod, setEditCod] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchShippingRates({
        page,
        pageSize,
        search: search.trim() || undefined,
        province: provinceFilter.trim() || undefined,
      });
      setRows(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, provinceFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async list fetch on filter/page change
    void load();
  }, [load]);

  async function readPreview(file: File) {
    setSelectedFile(file);
    setSuccess(null);
    setError(null);
    try {
      const text = await file.text();
      const preview = parseShippingRatesCsvPreview(text);
      setPreviewHeaders(preview.headers);
      setPreviewRows(preview.rows);
    } catch {
      setPreviewHeaders([]);
      setPreviewRows([]);
    }
  }

  function onFileChosen(file: File | null) {
    if (!file) {
      setSelectedFile(null);
      setPreviewHeaders([]);
      setPreviewRows([]);
      return;
    }
    void readPreview(file);
  }

  async function submitImport() {
    setError(null);
    setSuccess(null);
    if (!selectedFile) {
      setError('Choose a .csv or .xlsx file to import.');
      return;
    }
    setImporting(true);
    try {
      const res = await uploadShippingRatesCsv(selectedFile);
      setSuccess(
        `Imported ${res.data.importedRows} row(s): ${res.data.created} created, ${res.data.updated} updated.`,
      );
      setSelectedFile(null);
      setPreviewHeaders([]);
      setPreviewRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setPage(1);
      await load();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setImporting(false);
    }
  }

  function startEdit(row: ShippingRate) {
    setEditingId(row.id);
    setEditRate(String(row.rateAmount));
    setEditCod(row.isCodAvailable);
  }

  async function saveEdit(id: string) {
    const amount = parseFloat(editRate);
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Rate amount must be a non-negative number.');
      return;
    }
    setSavingId(id);
    setError(null);
    try {
      await updateShippingRate(id, {
        rateAmount: amount,
        isCodAvailable: editCod,
      });
      setEditingId(null);
      setSuccess('Shipping rate updated.');
      await load();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSavingId(null);
    }
  }

  async function removeRate(id: string) {
    if (!window.confirm('Delete this shipping rate rule?')) return;
    setError(null);
    try {
      await deleteShippingRate(id);
      setSuccess('Shipping rate deleted.');
      await load();
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            CSV province/city matrix
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Weight-band rows by province and city. Empty city = province
            default. See also{' '}
            <Link href="/shipping" className="font-medium underline">
              zones &amp; methods
            </Link>
            .
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Upload CSV matrix
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Columns:{' '}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
            Province, City, MinWeight, MaxWeight, RateAmount
          </code>
          . Leave City blank for province-wide defaults.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={downloadShippingRatesTemplate}
            className="text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
          >
            Download sample CSV template
          </button>
        </div>

        <div
          className={`mt-4 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragOver
              ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900'
              : 'border-zinc-300 dark:border-zinc-700'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0] ?? null;
            onFileChosen(file);
          }}
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Drag &amp; drop a CSV/XLSX file here, or choose a file
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)}
            className="mt-3 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900"
          />
          {selectedFile ? (
            <p className="mt-2 text-xs text-zinc-500">Selected: {selectedFile.name}</p>
          ) : null}
        </div>

        {previewHeaders.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Import preview (first rows)
            </h3>
            <table className="mt-2 min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {previewHeaders.map((h) => (
                    <th key={h} className="px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    {previewHeaders.map((_, j) => (
                      <td key={j} className="px-3 py-2 whitespace-nowrap">
                        {row[j] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void submitImport()}
          disabled={importing || !selectedFile}
          className={`${adminUi.btnPrimary} mt-4`}
        >
          {importing ? 'Importing…' : 'Import shipping rates'}
        </button>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Active rate rules
            </h2>
            <p className="mt-1 text-xs text-zinc-500">{total} rule(s)</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search province or city"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <input
              value={provinceFilter}
              onChange={(e) => {
                setPage(1);
                setProvinceFilter(e.target.value);
              }}
              placeholder="Filter province"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {success}
          </p>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-zinc-500">No shipping rates yet. Upload a CSV to get started.</p>
          ) : (
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2">Province</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Min kg</th>
                  <th className="px-3 py-2">Max kg</th>
                  <th className="px-3 py-2">Rate</th>
                  <th className="px-3 py-2">COD</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {rows.map((row) => {
                  const isEditing = editingId === row.id;
                  return (
                    <tr key={row.id}>
                      <td className="px-3 py-2">{row.province}</td>
                      <td className="px-3 py-2 text-zinc-500">
                        {row.city || '(province default)'}
                      </td>
                      <td className="px-3 py-2">{row.minWeightKg}</td>
                      <td className="px-3 py-2">{row.maxWeightKg}</td>
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <input
                            value={editRate}
                            onChange={(e) => setEditRate(e.target.value)}
                            className="w-24 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
                          />
                        ) : (
                          <span className="font-medium">{row.rateAmount}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editCod}
                              onChange={(e) => setEditCod(e.target.checked)}
                            />
                            COD
                          </label>
                        ) : row.isCodAvailable ? (
                          'Yes'
                        ) : (
                          'No'
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                disabled={savingId === row.id}
                                onClick={() => void saveEdit(row.id)}
                                className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
                              >
                                {savingId === row.id ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="text-sm text-zinc-500 underline"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(row)}
                                className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
                              >
                                Override
                              </button>
                              <button
                                type="button"
                                onClick={() => void removeRate(row.id)}
                                className="text-sm text-red-600 underline dark:text-red-400"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 disabled:opacity-50 dark:border-zinc-600"
            >
              Previous
            </button>
            <span className="text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 disabled:opacity-50 dark:border-zinc-600"
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

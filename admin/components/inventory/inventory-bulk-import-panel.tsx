'use client';

import { adminUi } from '@/lib/admin-ui';
import { useRef, useState } from 'react';
import {
  DEFAULT_WAREHOUSE_ID,
  bulkImportInventoryStock,
  downloadInventoryImportTemplate,
} from '@/lib/api/inventory';
import { formatApiError } from '@/lib/api/error-message';

export function InventoryBulkImportPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [warehouseId, setWarehouseId] = useState(DEFAULT_WAREHOUSE_ID);
  const [defaultReason, setDefaultReason] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<Array<{
    variantId: string;
    previousQuantity: number;
    newQuantity: number;
  }> | null>(null);

  async function submitImport() {
    setError(null);
    setSuccess(null);
    setLastResult(null);

    if (!selectedFile) {
      setError('Choose a .csv or .xlsx file to import.');
      return;
    }

    setImporting(true);
    try {
      const res = await bulkImportInventoryStock(
        selectedFile,
        warehouseId.trim() || DEFAULT_WAREHOUSE_ID,
        defaultReason.trim() || undefined,
      );
      setSuccess(
        `Imported ${res.data.importedRows} row(s) and updated ${res.data.updated.length} variant(s).`,
      );
      setLastResult(
        res.data.updated.map((row) => ({
          variantId: row.variantId,
          previousQuantity: row.previousQuantity,
          newQuantity: row.newQuantity,
        })),
      );
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Bulk import stock</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Upload a CSV or Excel file with columns{' '}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">variant_id</code>,{' '}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">quantity_delta</code>, and optional{' '}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">reason</code>. Rows with a zero or
        blank delta are skipped.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <button
            type="button"
            onClick={downloadInventoryImportTemplate}
            className="text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
          >
            Download sample template (CSV)
          </button>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Warehouse ID</label>
          <input
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Default reason (optional)
          </label>
          <input
            value={defaultReason}
            onChange={(e) => setDefaultReason(e.target.value)}
            placeholder="Used when a row has no reason column"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Import file</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900"
          />
          {selectedFile ? (
            <p className="mt-1 text-xs text-zinc-500">Selected: {selectedFile.name}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void submitImport()}
          disabled={importing}
          className={adminUi.btnPrimary}
        >
          {importing ? 'Importing…' : 'Import stock file'}
        </button>
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

      {lastResult && lastResult.length > 0 ? (
        <div className="mt-6 overflow-x-auto border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Import results</h3>
          <table className="mt-3 min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Variant ID</th>
                <th className="px-3 py-2">Previous</th>
                <th className="px-3 py-2">New</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {lastResult.map((row) => (
                <tr key={row.variantId}>
                  <td className="px-3 py-2 font-mono text-xs">{row.variantId}</td>
                  <td className="px-3 py-2">{row.previousQuantity}</td>
                  <td className="px-3 py-2 font-semibold">{row.newQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

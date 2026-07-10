import { BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';

export type InventoryImportRow = {
  variantId: string;
  quantityDelta: number;
  reason?: string;
  rowNumber: number;
};

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '_');
}

function pickColumnKey(headers: string[], aliases: string[]): string | null {
  for (const header of headers) {
    const normalized = normalizeHeader(header);
    if (aliases.includes(normalized)) {
      return header;
    }
  }
  return null;
}

const VARIANT_ID_KEYS = ['variant_id', 'variantid', 'target_id', 'targetid'];
const DELTA_KEYS = ['quantity_delta', 'quantitydelta', 'delta'];
const REASON_KEYS = ['reason', 'note', 'notes'];

function parseDelta(value: unknown, rowNumber: number): number {
  if (value === null || value === undefined || value === '') {
    throw new BadRequestException(
      `Row ${rowNumber}: quantity_delta is required`,
    );
  }
  const n =
    typeof value === 'number' ? value : parseInt(String(value).trim(), 10);
  if (!Number.isFinite(n)) {
    throw new BadRequestException(
      `Row ${rowNumber}: quantity_delta must be a whole number`,
    );
  }
  return n;
}

function mapRecordToRow(
  record: Record<string, unknown>,
  rowNumber: number,
  variantKey: string,
  deltaKey: string,
  reasonKey: string | null,
): InventoryImportRow | null {
  const variantId = String(record[variantKey] ?? '').trim();
  const rawDelta = record[deltaKey];
  const hasDelta =
    rawDelta !== null &&
    rawDelta !== undefined &&
    String(rawDelta).trim() !== '';

  if (!variantId && !hasDelta) {
    return null;
  }
  if (!variantId) {
    throw new BadRequestException(`Row ${rowNumber}: variant_id is required`);
  }

  const quantityDelta = hasDelta ? parseDelta(rawDelta, rowNumber) : 0;
  if (quantityDelta === 0) {
    return null;
  }

  const reason =
    reasonKey &&
    record[reasonKey] != null &&
    String(record[reasonKey]).trim() !== ''
      ? String(record[reasonKey]).trim()
      : undefined;

  return { variantId, quantityDelta, reason, rowNumber };
}

function recordsFromSheetRows(rows: unknown[][]): Record<string, unknown>[] {
  if (!rows.length) {
    throw new BadRequestException('Import file is empty');
  }
  const headerRow = rows[0].map((cell) => String(cell ?? '').trim());
  if (headerRow.every((h) => !h)) {
    throw new BadRequestException('Import file is missing a header row');
  }
  return rows.slice(1).map((row) => {
    const record: Record<string, unknown> = {};
    headerRow.forEach((header, index) => {
      if (header) {
        record[header] = row[index];
      }
    });
    return record;
  });
}

export function parseInventoryImportFile(
  buffer: Buffer,
  originalName: string,
  mimeType?: string,
): InventoryImportRow[] {
  const lowerName = (originalName || '').toLowerCase();
  const isCsv =
    lowerName.endsWith('.csv') ||
    (mimeType || '').includes('csv') ||
    (mimeType || '').includes('text/plain');
  const isXlsx =
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.xls') ||
    (mimeType || '').includes('spreadsheet') ||
    (mimeType || '').includes('excel');

  if (!isCsv && !isXlsx) {
    throw new BadRequestException('Only .csv and .xlsx files are supported');
  }

  let records: Record<string, unknown>[];

  if (isCsv) {
    const text = buffer.toString('utf-8').replace(/^\uFEFF/, '');
    const workbook = XLSX.read(text, { type: 'string' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
    });
    records = recordsFromSheetRows(rows);
  } else {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
    });
    records = recordsFromSheetRows(rows);
  }

  if (!records.length) {
    throw new BadRequestException('Import file has no data rows');
  }

  const headers = Object.keys(records[0] ?? {});
  const variantKey = pickColumnKey(headers, VARIANT_ID_KEYS);
  const deltaKey = pickColumnKey(headers, DELTA_KEYS);
  const reasonKey = pickColumnKey(headers, REASON_KEYS);

  if (!variantKey || !deltaKey) {
    throw new BadRequestException(
      'Import file must include columns: variant_id, quantity_delta (reason is optional)',
    );
  }

  const parsed: InventoryImportRow[] = [];
  records.forEach((record, index) => {
    const row = mapRecordToRow(
      record,
      index + 2,
      variantKey,
      deltaKey,
      reasonKey,
    );
    if (row) {
      parsed.push(row);
    }
  });

  if (!parsed.length) {
    throw new BadRequestException(
      'No non-zero quantity_delta rows found in import file',
    );
  }

  return parsed;
}

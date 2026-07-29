import { BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';

export type ShippingRateCsvRow = {
  province: string;
  city: string | null;
  minWeightKg: number;
  maxWeightKg: number;
  rateAmount: number;
  isCodAvailable: boolean;
  rowNumber: number;
};

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function pickColumnKey(headers: string[], aliases: string[]): string | null {
  for (const header of headers) {
    if (aliases.includes(normalizeHeader(header))) {
      return header;
    }
  }
  return null;
}

const PROVINCE_KEYS = ['province', 'state', 'region'];
const CITY_KEYS = ['city'];
const MIN_WEIGHT_KEYS = ['minweight', 'minweightkg', 'min_weight', 'weightmin'];
const MAX_WEIGHT_KEYS = ['maxweight', 'maxweightkg', 'max_weight', 'weightmax'];
const RATE_KEYS = ['rateamount', 'rate', 'amount', 'price', 'shippingrate'];
const COD_KEYS = ['iscodavailable', 'codavailable', 'cod'];

function cellString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

function parseNumber(value: unknown, field: string, rowNumber: number): number {
  if (
    value === null ||
    value === undefined ||
    cellString(value).trim() === ''
  ) {
    throw new BadRequestException(`Row ${rowNumber}: ${field} is required`);
  }
  const n =
    typeof value === 'number' ? value : parseFloat(cellString(value).trim());
  if (!Number.isFinite(n)) {
    throw new BadRequestException(
      `Row ${rowNumber}: ${field} must be a number`,
    );
  }
  return n;
}

function parseCod(value: unknown): boolean {
  if (
    value === null ||
    value === undefined ||
    cellString(value).trim() === ''
  ) {
    return true;
  }
  const raw = cellString(value).trim().toLowerCase();
  if (['false', '0', 'no', 'n'].includes(raw)) return false;
  if (['true', '1', 'yes', 'y'].includes(raw)) return true;
  return true;
}

function mapRecordToRow(
  record: Record<string, unknown>,
  rowNumber: number,
  keys: {
    province: string;
    city: string | null;
    minWeight: string;
    maxWeight: string;
    rate: string;
    cod: string | null;
  },
): ShippingRateCsvRow | null {
  const province = cellString(record[keys.province]).trim();
  const cityRaw = keys.city ? cellString(record[keys.city]).trim() : '';
  const hasAny =
    province ||
    cityRaw ||
    (keys.minWeight &&
      record[keys.minWeight] != null &&
      cellString(record[keys.minWeight]).trim() !== '');

  if (!hasAny) return null;

  if (!province) {
    throw new BadRequestException(`Row ${rowNumber}: Province is required`);
  }

  const minWeightKg = parseNumber(
    record[keys.minWeight],
    'MinWeight',
    rowNumber,
  );
  const maxWeightKg = parseNumber(
    record[keys.maxWeight],
    'MaxWeight',
    rowNumber,
  );
  const rateAmount = parseNumber(record[keys.rate], 'RateAmount', rowNumber);

  if (maxWeightKg < minWeightKg) {
    throw new BadRequestException(
      `Row ${rowNumber}: MaxWeight must be >= MinWeight`,
    );
  }

  return {
    province,
    city: cityRaw || null,
    minWeightKg,
    maxWeightKg,
    rateAmount,
    isCodAvailable: keys.cod ? parseCod(record[keys.cod]) : true,
    rowNumber,
  };
}

/**
 * Parse a courier shipping-rate CSV/XLSX buffer.
 * Expected columns: Province, City, MinWeight, MaxWeight, RateAmount
 * Optional: IsCodAvailable
 */
export function parseShippingRatesImport(file: {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
}): ShippingRateCsvRow[] {
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new BadRequestException('Import file has no sheets');
  }

  const sheet = workbook.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  });

  if (records.length === 0) {
    throw new BadRequestException('Import file has no data rows');
  }

  const headers = Object.keys(records[0] ?? {});
  const provinceKey = pickColumnKey(headers, PROVINCE_KEYS);
  const cityKey = pickColumnKey(headers, CITY_KEYS);
  const minWeightKey = pickColumnKey(headers, MIN_WEIGHT_KEYS);
  const maxWeightKey = pickColumnKey(headers, MAX_WEIGHT_KEYS);
  const rateKey = pickColumnKey(headers, RATE_KEYS);
  const codKey = pickColumnKey(headers, COD_KEYS);

  if (!provinceKey || !minWeightKey || !maxWeightKey || !rateKey) {
    throw new BadRequestException(
      'CSV must include columns: Province, City, MinWeight, MaxWeight, RateAmount',
    );
  }

  const rows: ShippingRateCsvRow[] = [];
  for (let i = 0; i < records.length; i++) {
    const mapped = mapRecordToRow(records[i], i + 2, {
      province: provinceKey,
      city: cityKey,
      minWeight: minWeightKey,
      maxWeight: maxWeightKey,
      rate: rateKey,
      cod: codKey,
    });
    if (mapped) rows.push(mapped);
  }

  if (rows.length === 0) {
    throw new BadRequestException('No valid shipping rate rows found in file');
  }

  return rows;
}

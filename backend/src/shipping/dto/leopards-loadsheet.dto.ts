import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export const LOADSHEET_ORDER_STATUSES = [
  'pending_loadsheet',
  'on_loadsheet',
  'all',
] as const;

export type LoadsheetOrderStatusFilter =
  (typeof LOADSHEET_ORDER_STATUSES)[number];

/**
 * Query for GET /admin/shipping/loadsheets/booked-packets
 */
export class ListLeopardsBookedOrdersQueryDto {
  /** ISO date (YYYY-MM-DD) — inclusive start of day (UTC). */
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  /** ISO date (YYYY-MM-DD) — inclusive end of day (UTC). */
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  /**
   * pending_loadsheet = has CN, no loadsheet id (default) — UI: BOOKED (no loadsheet)
   * on_loadsheet = has CN + loadsheet id
   * all = any order with a Leopards CN — UI: ALL
   */
  @IsOptional()
  @IsIn(LOADSHEET_ORDER_STATUSES)
  status?: LoadsheetOrderStatusFilter;
}

function toStringArray(value: unknown): string[] | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    return value.map((v) => String(v ?? '').trim()).filter((v) => Boolean(v));
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return undefined;
}

/**
 * Body for POST /admin/shipping/loadsheets/generate
 * Provide either cnNumbers or orderIds (or both — unioned).
 */
export class GenerateLeopardsLoadsheetDto {
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  @ValidateIf((o: GenerateLeopardsLoadsheetDto) => !o.orderIds?.length)
  cnNumbers?: string[];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  @ValidateIf((o: GenerateLeopardsLoadsheetDto) => !o.cnNumbers?.length)
  orderIds?: string[];

  @IsOptional()
  @IsString()
  courierName?: string;

  @IsOptional()
  @IsString()
  courierCode?: string;
}

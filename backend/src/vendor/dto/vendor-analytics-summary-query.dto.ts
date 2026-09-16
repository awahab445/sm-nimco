import { IsIn, IsOptional, IsString } from 'class-validator';

/** Quick presets accepted by GET /vendor/analytics/summary */
export const VENDOR_ANALYTICS_PERIODS = [
  'today',
  '7days',
  '30days',
  'custom',
  // Aliases kept for older clients
  '7d',
  '30d',
  'last7days',
  'last30days',
] as const;

export type VendorAnalyticsPeriod = (typeof VENDOR_ANALYTICS_PERIODS)[number];

export class VendorAnalyticsSummaryQueryDto {
  /**
   * Quick preset: today | 7days | 30days | custom
   * Defaults to `today` when omitted (and no start/end provided).
   */
  @IsOptional()
  @IsString()
  @IsIn([...VENDOR_ANALYTICS_PERIODS])
  period?: VendorAnalyticsPeriod;

  /** Inclusive start (YYYY-MM-DD or ISO datetime). Alias: from */
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  from?: string;

  /** Inclusive end (YYYY-MM-DD or ISO datetime). Alias: to */
  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  to?: string;
}

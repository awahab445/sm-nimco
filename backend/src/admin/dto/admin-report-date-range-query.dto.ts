import { IsOptional, IsString } from 'class-validator';

/** Shared date-range query for reports (`startDate` / `endDate` ISO strings). */
export class AdminReportDateRangeQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

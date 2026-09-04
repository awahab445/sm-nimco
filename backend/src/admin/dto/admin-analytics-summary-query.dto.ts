import { IsOptional, IsString } from 'class-validator';

export class AdminAnalyticsSummaryQueryDto {
  /** Inclusive start (ISO date or datetime), e.g. 2026-09-01 */
  @IsOptional()
  @IsString()
  from?: string;

  /** Inclusive end (ISO date or datetime), e.g. 2026-09-04 */
  @IsOptional()
  @IsString()
  to?: string;
}

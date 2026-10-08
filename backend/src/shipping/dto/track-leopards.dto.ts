import { IsOptional, IsString, ValidateIf } from 'class-validator';

/**
 * Body for POST /admin/shipping/leopards/track
 * Prefers `trackingNumber` (admin UI); also accepts `trackNumbers` for bulk/API.
 */
export class TrackLeopardsDto {
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @ValidateIf((_, v) => typeof v === 'string' || Array.isArray(v))
  trackNumbers?: string | string[];
}

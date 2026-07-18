import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Optional Meta Conversions API matching fields from the browser.
 * Sent on cart/checkout mutations so server events can dedupe with Pixel.
 */
export class MetaCapiClientDto {
  /** Shared with Pixel `eventID` for deduplication. */
  @IsOptional()
  @IsString()
  @MaxLength(256)
  eventId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  fbp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  fbc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  eventSourceUrl?: string;
}

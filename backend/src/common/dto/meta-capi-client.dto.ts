import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Optional Meta Conversions API matching fields from the browser.
 * Sent on cart/checkout mutations so server events can dedupe with Pixel.
 * Email/phone are sent raw; CAPI hashes them as `em` / `ph`.
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

  /** Logged-in / stable customer id — sent to Meta as plain `external_id`. */
  @IsOptional()
  @IsString()
  @MaxLength(256)
  externalId?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  /** TikTok pixel cookie `_ttp` (Events API matching). */
  @IsOptional()
  @IsString()
  @MaxLength(512)
  ttp?: string;

  /** TikTok ad click id captured from the landing URL. */
  @IsOptional()
  @IsString()
  @MaxLength(512)
  ttclid?: string;

  /** Only when the app already has a Facebook Login ID — never invent. */
  @IsOptional()
  @IsString()
  @MaxLength(256)
  fbLoginId?: string;
}

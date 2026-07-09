import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const MEASUREMENT_ID_REGEX = /^G-[A-Z0-9]{6,}$/;
const GTM_ID_REGEX = /^GTM-[A-Z0-9]+$/;
const META_PIXEL_ID_REGEX = /^\d{15,16}$/;

export class UpdateGa4SettingsDto {
  @IsOptional()
  @IsString()
  @Matches(MEASUREMENT_ID_REGEX, {
    message: 'measurementId must be a valid GA4 ID (e.g. G-XXXXXXXXXX)',
  })
  measurementId?: string | null;

  @IsOptional()
  @IsString()
  @Matches(GTM_ID_REGEX, {
    message: 'gtmId must be a valid GTM container ID (e.g. GTM-XXXXXXX)',
  })
  gtmId?: string | null;

  @IsOptional()
  @IsString()
  @Matches(META_PIXEL_ID_REGEX, {
    message: 'metaPixelId must be a valid Meta Pixel ID (15–16 digits)',
  })
  metaPixelId?: string | null;

  @IsOptional()
  @IsBoolean()
  metaPixelEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  debugMode?: boolean;

  @IsOptional()
  @IsBoolean()
  trackPageViews?: boolean;

  @IsOptional()
  @IsBoolean()
  trackCartEvents?: boolean;

  @IsOptional()
  @IsBoolean()
  trackCheckoutSteps?: boolean;

  @IsOptional()
  @IsBoolean()
  trackPurchases?: boolean;

  @IsOptional()
  @IsBoolean()
  trackRefunds?: boolean;

  @IsOptional()
  @IsBoolean()
  trackCustomEvents?: boolean;

  @IsOptional()
  @IsBoolean()
  anonymizeIp?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;
}

export class ToggleGa4SettingsDto {
  @IsBoolean()
  isEnabled: boolean;
}

export const GA4_MEASUREMENT_ID_REGEX = MEASUREMENT_ID_REGEX;
export const GTM_CONTAINER_ID_REGEX = GTM_ID_REGEX;
export const META_PIXEL_ID_REGEX_EXPORT = META_PIXEL_ID_REGEX;

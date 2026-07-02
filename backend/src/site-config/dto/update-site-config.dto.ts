import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

const LOGO_DIMENSION_MIN = 16;
const LOGO_DIMENSION_MAX = 512;
const ANNOUNCEMENT_TEXT_MAX_LENGTH = 180;

export class UpdateSiteConfigDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_obj, value) => typeof value === 'string')
  @IsString()
  @Matches(/^(https?:\/\/.+|\/.+)$/i, {
    message: 'logoUrl must be an absolute URL or absolute path',
  })
  logoUrl?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
  })
  @IsBoolean()
  removeLogo?: boolean;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(ANNOUNCEMENT_TEXT_MAX_LENGTH, {
    message: `announcementText must be at most ${ANNOUNCEMENT_TEXT_MAX_LENGTH} characters`,
  })
  announcementText?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
  })
  @IsBoolean()
  showAnnouncement?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  @IsInt()
  @Min(LOGO_DIMENSION_MIN)
  @Max(LOGO_DIMENSION_MAX)
  logoWidth?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  @IsInt()
  @Min(LOGO_DIMENSION_MIN)
  @Max(LOGO_DIMENSION_MAX)
  logoHeight?: number;
}

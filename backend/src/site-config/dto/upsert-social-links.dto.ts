import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const SOCIAL_PLATFORMS = [
  'facebook',
  'x',
  'instagram',
  'youtube',
  'pinterest',
  'tiktok',
  'whatsapp',
  'linkedin',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export class UpsertSocialLinkItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsIn(SOCIAL_PLATFORMS)
  platform!: SocialPlatform;

  @IsString()
  @MaxLength(1024)
  @IsUrl({ require_protocol: true }, { message: 'URL must include http:// or https://' })
  url!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ReplaceSocialLinksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSocialLinkItemDto)
  links!: UpsertSocialLinkItemDto[];
}

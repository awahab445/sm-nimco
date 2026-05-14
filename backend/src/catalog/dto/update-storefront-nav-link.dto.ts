import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class UpdateStorefrontNavLinkDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  secondaryLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  href?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['LINK', 'MEGA_CATEGORIES'])
  kind?: string;

  @IsOptional()
  @IsString()
  @IsIn(['header', 'mega'])
  zone?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsOptional()
  @IsBoolean()
  openMegaMenu?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  bannerImageUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  bannerHref?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  bannerAlt?: string | null;
}

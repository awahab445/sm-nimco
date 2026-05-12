import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateStorefrontNavLinkDto {
  @IsString()
  @MaxLength(128)
  label!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  secondaryLabel?: string | null;

  @IsString()
  @MaxLength(512)
  href!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  @IsIn(['LINK', 'MEGA_CATEGORIES'])
  kind!: string;
}

import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpsertCmsSlideDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ctaHref?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpsertCmsSliderDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(255)
  identifier!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  autoplayMs?: number;

  /** Pixel width applied to all slides in this slider (storefront + upload guidance). */
  @IsOptional()
  @IsInt()
  @Min(64)
  @Max(8192)
  slideWidthPx?: number | null;

  /** Pixel height applied to all slides (with width, fixes aspect on storefront). */
  @IsOptional()
  @IsInt()
  @Min(64)
  @Max(8192)
  slideHeightPx?: number | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpsertCmsSlideDto)
  slides!: UpsertCmsSlideDto[];
}

import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BundleDealItemDto } from './bundle-deal-item.dto';
import { BundleDealStatus, parseBooleanField, parseItemsField, parseNumberField } from './create-bundle-deal.dto';

export class UpdateBundleDealDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BundleDealStatus)
  status?: BundleDealStatus;

  @IsOptional()
  @Transform(({ value }) => parseBooleanField(value))
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseNumberField(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dealPrice?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '') return null;
    return typeof value === 'string' ? value.trim() : value;
  })
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsDateString()
  validFrom?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsDateString()
  validTo?: string | null;

  @IsOptional()
  @Transform(({ value }) => parseItemsField(value))
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => BundleDealItemDto)
  items?: BundleDealItemDto[];
}

import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from './create-product.dto';

export class ProductQueryDto {
  /** Single category id or comma-separated ids (OR). */
  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  /** Shorthand `min-max` (e.g. `10-500`); used when min/max not both set. */
  @IsString()
  @IsOptional()
  price?: string;

  /** Comma-separated; matches `attributes.brand` (exact). */
  @IsString()
  @IsOptional()
  brands?: string;

  /** Comma-separated; matches `attributes.size` or `attributes.Size` (exact). */
  @IsString()
  @IsOptional()
  sizes?: string;

  /** JSON object: `{"brand":["a"],"color":["red"]}` — merged with legacy `brands` / `sizes` query params. */
  @IsString()
  @IsOptional()
  attr?: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

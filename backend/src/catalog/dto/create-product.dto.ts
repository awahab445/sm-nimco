import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
  IsDecimal,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductType {
  SIMPLE = 'simple',
  CONFIGURABLE = 'configurable',
  BUNDLE = 'bundle',
  VIRTUAL = 'virtual',
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum ProductVisibility {
  CATALOG = 'catalog',
  SEARCH = 'search',
  BOTH = 'both',
  NONE = 'none',
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsEnum(ProductVisibility)
  @IsOptional()
  visibility?: ProductVisibility;

  @IsString()
  @IsOptional()
  taxClassId?: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metaData?: Record<string, any>;
}


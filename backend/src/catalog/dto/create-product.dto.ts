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
import { Type, Transform } from 'class-transformer';

const emptyStringToNull = ({ value }: { value: unknown }) =>
  value === '' ? null : value;

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

  @Transform(emptyStringToNull)
  @IsString()
  @IsOptional()
  description?: string | null;

  @Transform(emptyStringToNull)
  @IsString()
  @IsOptional()
  shortDescription?: string | null;

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  shippingWeight?: number;

  @IsString()
  @IsOptional()
  shippingWeightUnit?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsEnum(ProductVisibility)
  @IsOptional()
  visibility?: ProductVisibility;

  @Transform(emptyStringToNull)
  @IsString()
  @IsOptional()
  taxClassId?: string | null;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metaData?: Record<string, any>;
}

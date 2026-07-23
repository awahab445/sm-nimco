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
import { plainToInstance, Transform, Type } from 'class-transformer';
import { BundleDealItemDto } from './bundle-deal-item.dto';

export function parseBooleanField(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === '') return undefined;
    return value.toLowerCase() === 'true';
  }
  return undefined;
}

export function parseNumberField(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (value === '' || value === null || value === undefined) return undefined;
  return Number(value);
}

/**
 * Multipart FormData sends `items` as a JSON string. Parse it and convert to
 * BundleDealItemDto class instances so ValidationPipe whitelist /
 * forbidNonWhitelisted work on nested properties (productId, variantId, quantity).
 */
export function parseItemsField(value: unknown): BundleDealItemDto[] | unknown {
  let parsed: unknown = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return value;
    try {
      parsed = JSON.parse(trimmed) as unknown;
    } catch {
      return value;
    }
  }
  if (!Array.isArray(parsed)) return parsed;
  return plainToInstance(BundleDealItemDto, parsed, {
    enableImplicitConversion: true,
  });
}

export enum BundleDealStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export class CreateBundleDealDto {
  @IsString()
  title: string;

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

  @Transform(({ value }) => parseNumberField(value) ?? value)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dealPrice: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @Transform(({ value }) => parseItemsField(value))
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => BundleDealItemDto)
  items: BundleDealItemDto[];
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateShippingFeeDto {
  @IsString()
  @IsNotEmpty()
  province: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalWeightKg?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculateFeeCartItemDto)
  items?: CalculateFeeCartItemDto[];
}

export class CalculateFeeCartItemDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}

export class UpdateShippingRateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rateAmount?: number;

  @IsOptional()
  @IsBoolean()
  isCodAvailable?: boolean;
}

export class CreateShippingRateDto {
  @IsString()
  @IsNotEmpty()
  province: string;

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsNumber()
  @Min(0)
  minWeightKg: number;

  @IsNumber()
  @Min(0)
  maxWeightKg: number;

  @IsNumber()
  @Min(0)
  rateAmount: number;

  @IsOptional()
  @IsBoolean()
  isCodAvailable?: boolean;
}

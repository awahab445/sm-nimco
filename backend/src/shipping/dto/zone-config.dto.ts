import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ShippingWeightRuleDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxBillableKg?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  includedKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerExtraKg?: number;
}

export class NationwideShippingMethodDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minBillableKg?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingWeightRuleDto)
  rules!: ShippingWeightRuleDto[];
}

export class UpdateZoneConfigDto {
  @ValidateNested()
  @Type(() => NationwideShippingMethodDto)
  economy_shipping!: NationwideShippingMethodDto;

  @ValidateNested()
  @Type(() => NationwideShippingMethodDto)
  overland_shipping!: NationwideShippingMethodDto;
}

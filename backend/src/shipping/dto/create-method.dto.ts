import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  IsEnum,
  Min,
  ValidateIf,
} from 'class-validator';

export enum ShippingMethodType {
  FLAT_RATE = 'flat_rate',
  WEIGHT_BASED = 'weight_based',
  AMOUNT_BASED = 'amount_based',
  COURIER_API = 'courier_api',
}

export class ShippingMethodConfigDto {
  // For flat_rate
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  // For weight_based
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseCostKgLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  // For amount_based
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeAbove?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costBelow?: number;

  // For courier_api
  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  serviceType?: string;
}

export class CreateMethodDto {
  @IsString()
  @IsNotEmpty()
  zoneId: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ShippingMethodType)
  type: ShippingMethodType;

  @IsOptional()
  @IsObject()
  config?: ShippingMethodConfigDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  courierConfig?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateMethodDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ShippingMethodType)
  type?: ShippingMethodType;

  @IsOptional()
  @IsObject()
  config?: ShippingMethodConfigDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  courierConfig?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

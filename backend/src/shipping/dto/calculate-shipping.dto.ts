import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}

export class CalculateShippingDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  customerGroupId?: string;

  /** Optional courier city UUID — preferred over city name for zone lookup. */
  @IsOptional()
  @IsString()
  cityId?: string;
}

export class ShippingOptionDto {
  methodId: string;
  methodCode: string;
  methodName: string;
  cost: number;
  currency: string;
  estimatedDays?: number;
  description?: string;
}

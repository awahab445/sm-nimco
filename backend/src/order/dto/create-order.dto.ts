import {
  IsString,
  IsOptional,
  IsObject,
  IsEmail,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  addressLine1: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

/** Pre-calculated totals from checkout (shipping, discounts, tax). */
export class OrderTotalsDto {
  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  discountTotal: number;

  @IsNumber()
  @Min(0)
  shippingTotal: number;

  @IsNumber()
  @Min(0)
  taxTotal: number;

  @IsNumber()
  @Min(0)
  grandTotal: number;
}

export class CreateOrderDto {
  @IsString()
  @IsUUID()
  cartId: string;

  @IsString()
  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  customerGroupId?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsString()
  @IsOptional()
  notes?: string;

  @ValidateNested()
  @Type(() => OrderTotalsDto)
  @IsOptional()
  totals?: OrderTotalsDto;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}


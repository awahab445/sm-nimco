import { IsString, IsOptional, IsObject, IsEmail, ValidateNested, IsUUID } from 'class-validator';
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

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}


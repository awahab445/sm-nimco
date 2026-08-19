import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
  Length,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  label?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lastName: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  company?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  addressLine1: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  state: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  postalCode?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2, { message: 'country must be a 2-letter ISO code' })
  country: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone: string;

  @IsOptional()
  @IsBoolean()
  isDefaultBilling?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefaultShipping?: boolean;
}

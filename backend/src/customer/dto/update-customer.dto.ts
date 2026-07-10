import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsEmail,
} from 'class-validator';

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  isGuest?: boolean;

  @IsUUID()
  @IsOptional()
  customerGroupId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

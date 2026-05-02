import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEmail } from 'class-validator';

export class StartCheckoutDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  cartId: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  customerId?: string;
}


import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsEmail,
} from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethodCode: string;

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @IsUrl()
  @IsOptional()
  returnUrl?: string;

  @IsUrl()
  @IsOptional()
  cancelUrl?: string;
}

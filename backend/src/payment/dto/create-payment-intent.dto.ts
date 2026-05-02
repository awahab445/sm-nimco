import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethodCode: string;

  @IsUrl()
  @IsOptional()
  returnUrl?: string;

  @IsUrl()
  @IsOptional()
  cancelUrl?: string;
}


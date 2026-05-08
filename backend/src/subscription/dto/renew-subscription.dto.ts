import { IsOptional, IsString } from 'class-validator';

export class RenewSubscriptionDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}

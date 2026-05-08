import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubscribeDto {
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangeSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}

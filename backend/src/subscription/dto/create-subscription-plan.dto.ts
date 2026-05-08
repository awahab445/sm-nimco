import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BillingCycle } from '../enums/billing-cycle.enum';

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsEnum(BillingCycle)
  billingCycle!: BillingCycle;

  @IsArray()
  features!: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

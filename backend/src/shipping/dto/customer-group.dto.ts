import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class AssignCustomerGroupDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  customerGroupId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedCost?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateCustomerGroupPricingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedCost?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

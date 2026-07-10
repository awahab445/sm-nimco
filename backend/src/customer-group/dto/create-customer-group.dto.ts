import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class CreateCustomerGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsUUID()
  @IsOptional()
  taxClassId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @ValidateIf((o) => o.discountPercent !== undefined)
  discountPercent?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  MaxLength,
  IsObject,
  Min,
  Max,
} from 'class-validator';

export class CreateTaxDto {
  @IsString()
  @IsNotEmpty()
  taxClassId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  country: string; // ISO 3166-1 alpha-2

  @IsString()
  @IsOptional()
  @MaxLength(100)
  region?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number; // Percentage (e.g., 20 for 20%)

  @IsBoolean()
  @IsOptional()
  isInclusive?: boolean; // Default: false

  @IsBoolean()
  @IsOptional()
  isActive?: boolean; // Default: true

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}


import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateCourierZoneRatesDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  rateUpTo5kg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rateUpTo10kg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perKgOver10kg?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}

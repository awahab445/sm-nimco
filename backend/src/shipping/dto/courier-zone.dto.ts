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
  rateLessThan10kg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rateGreaterOrEqual10kg?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}

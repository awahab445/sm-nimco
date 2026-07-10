import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CreateTaxClassDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string; // standard | reduced | exempt

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

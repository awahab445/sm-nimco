import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class ProductOptionSelectionDto {
  @IsString()
  optionId!: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  valueIds!: string[];
}

export class UpsertProductOptionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionSelectionDto)
  options!: ProductOptionSelectionDto[];
}


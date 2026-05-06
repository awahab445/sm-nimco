import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  /** Omit to leave unchanged; send `null` to clear parent */
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsUUID()
  parentId?: string | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

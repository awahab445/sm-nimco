import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min } from 'class-validator';

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

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

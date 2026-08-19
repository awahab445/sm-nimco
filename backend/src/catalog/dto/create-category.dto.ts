import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

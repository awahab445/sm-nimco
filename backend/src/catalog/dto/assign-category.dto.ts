import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class AssignCategoryDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;
}


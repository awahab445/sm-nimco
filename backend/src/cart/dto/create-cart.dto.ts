import { IsOptional, IsString, Length } from 'class-validator';

export class CreateCartDto {
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}

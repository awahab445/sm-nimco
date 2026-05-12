import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

const CODE_RE = /^[a-z][a-z0-9_]{0,62}$/;

export class UpdateStorefrontFilterDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(CODE_RE, { message: 'code must be lowercase letters, digits, underscore; start with a letter' })
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

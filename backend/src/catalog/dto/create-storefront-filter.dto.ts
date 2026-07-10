import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const CODE_RE = /^[a-z][a-z0-9_]{0,62}$/;

export class CreateStorefrontFilterDto {
  @IsString()
  @MaxLength(64)
  @Matches(CODE_RE, {
    message:
      'code must be lowercase letters, digits, underscore; start with a letter',
  })
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsIn(['CATEGORY', 'PRICE', 'ATTRIBUTE'])
  kind!: 'CATEGORY' | 'PRICE' | 'ATTRIBUTE';

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;
}

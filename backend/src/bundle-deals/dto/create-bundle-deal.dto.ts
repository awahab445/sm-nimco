import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BundleDealItemDto } from './bundle-deal-item.dto';

export enum BundleDealStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export class CreateBundleDealDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BundleDealStatus)
  status?: BundleDealStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dealPrice: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => BundleDealItemDto)
  items: BundleDealItemDto[];
}

import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';
import { BundleDealStatus } from './create-bundle-deal.dto';

export class ListBundleDealsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(BundleDealStatus)
  status?: BundleDealStatus;

  @IsOptional()
  @IsBooleanString()
  featured?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

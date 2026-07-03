import { ArrayMinSize, IsArray, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BundleDealItemDto } from './bundle-deal-item.dto';

export class PreviewBundlePricingDto {
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => BundleDealItemDto)
  items: BundleDealItemDto[];

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dealPrice?: number;
}

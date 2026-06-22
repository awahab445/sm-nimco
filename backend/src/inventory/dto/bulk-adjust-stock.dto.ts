import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BulkAdjustStockItemDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  /** Signed delta applied to on-hand quantity. */
  @IsInt()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class BulkAdjustStockDto {
  @IsString()
  @IsOptional()
  warehouseId?: string;

  @IsString()
  @IsOptional()
  defaultReason?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkAdjustStockItemDto)
  items: BulkAdjustStockItemDto[];
}

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SetProductInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  targetId!: string; // variant id, or product id for simple product row

  @IsInt()
  @Min(0)
  quantity!: number; // absolute on-hand quantity
}

export class SetProductInventoryDto {
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SetProductInventoryItemDto)
  items!: SetProductInventoryItemDto[];
}

import { IsString, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export const DEFAULT_WAREHOUSE_ID = 'default-warehouse';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  /** Warehouse id. Omit or use "default-warehouse" for storefront visibility. */
  @IsString()
  @IsOptional()
  warehouseId?: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}


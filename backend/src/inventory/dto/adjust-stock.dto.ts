import { IsString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export const DEFAULT_WAREHOUSE_ID = 'default-warehouse';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  /** Warehouse id. Omit or use "default-warehouse" for storefront visibility. */
  @IsString()
  @IsOptional()
  warehouseId?: string;

  /** Delta added to on-hand quantity (negative to decrease). */
  @IsInt()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}


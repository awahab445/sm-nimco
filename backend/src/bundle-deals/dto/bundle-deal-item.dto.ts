import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class BundleDealItemDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number = 1;
}

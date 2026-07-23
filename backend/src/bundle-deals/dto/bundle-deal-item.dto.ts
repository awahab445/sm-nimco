import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class BundleDealItemDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === '' ? undefined : value,
  )
  @IsUUID()
  variantId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number = 1;
}

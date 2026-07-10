import { IsString, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class ReserveStockDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  referenceType: 'cart' | 'order';

  @IsString()
  @IsNotEmpty()
  referenceId: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  expiresInMinutes?: number; // Default 15 minutes
}

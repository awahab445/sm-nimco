import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsUUID } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  variantId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}


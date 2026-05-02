import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  categoryIds?: string[];
}

export class ValidatePromotionDto {
  @IsString()
  promotionId: string;

  @IsNumber()
  subtotal: number;

  @IsArray()
  items: CartItem[];

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  customerGroupId?: string;

  @IsString()
  @IsOptional()
  couponCode?: string;
}


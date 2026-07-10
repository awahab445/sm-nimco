import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class ApplyPromotionDto {
  @IsString()
  @IsOptional()
  cartId?: string;

  @IsString()
  @IsOptional()
  checkoutId?: string;

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  promotionIds?: string[];

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  customerGroupId?: string;
}

export class ApplyPromotionToCartDto {
  @IsString()
  @IsNotEmpty()
  cartId: string;

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  customerGroupId?: string;
}

export class ApplyPromotionToCheckoutDto {
  @IsString()
  @IsNotEmpty()
  checkoutId: string;

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  customerGroupId?: string;
}

import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsObject,
  IsArray,
  Min,
  Max,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  BUY_X_GET_Y = 'buy_x_get_y',
  FREE_SHIPPING = 'free_shipping',
}

export enum PromotionScope {
  CART = 'cart',
  PRODUCT = 'product',
  CATEGORY = 'category',
}

export interface PromotionConditions {
  minOrderAmount?: number;
  products?: string[];
  categories?: string[];
  customerGroups?: string[]; // Deprecated: use eligibleCustomerGroupIds instead
  maxDiscountAmount?: number;
}

export class CreatePromotionDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PromotionType)
  type: PromotionType;

  @IsEnum(PromotionScope)
  @IsOptional()
  scope?: PromotionScope;

  @IsNumber()
  @IsOptional()
  @ValidateIf(
    (o) =>
      o.type === PromotionType.PERCENTAGE ||
      o.type === PromotionType.FIXED_AMOUNT,
  )
  @Min(0)
  @Type(() => Number)
  discountValue?: number;

  @IsString()
  @IsOptional()
  discountType?: 'percentage' | 'fixed_amount';

  @IsBoolean()
  @IsOptional()
  isStackable?: boolean;

  @IsBoolean()
  @IsOptional()
  isExclusive?: boolean;

  @IsObject()
  @IsOptional()
  conditions?: PromotionConditions;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  usageLimit?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  usageLimitPerUser?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variantIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsBoolean()
  @IsOptional()
  appliesToAllGroups?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eligibleCustomerGroupIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excludedCustomerGroupIds?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

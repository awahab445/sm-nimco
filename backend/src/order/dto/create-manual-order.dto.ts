import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsArray,
  ArrayMinSize,
  IsInt,
  IsBoolean,
  ValidateIf,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './create-order.dto';
import { MANUAL_ORDER_PAYMENT_METHODS } from '../constants/order.constants';

/**
 * Sentinel productId stored for unlisted/custom manual lines (no catalog product).
 * Not a real Product row — inventory and catalog lookups must skip these.
 */
export const CUSTOM_MANUAL_ORDER_PRODUCT_ID =
  '00000000-0000-4000-8000-0000000000c1';

const MAX_MANUAL_ITEM_QUANTITY = 9999;

export function isManualCustomItem(item: {
  isCustom?: boolean;
  productId?: string | null;
}): boolean {
  if (item.isCustom === true) return true;
  if (!item.productId) return true;
  return item.productId === CUSTOM_MANUAL_ORDER_PRODUCT_ID;
}

export class ManualOrderItemDto {
  /**
   * Catalog product. Required for listed items; omit (or set isCustom) for unlisted lines.
   */
  @ValidateIf((o: ManualOrderItemDto) => !isManualCustomItem(o))
  @IsUUID()
  productId?: string;

  @ValidateIf((o: ManualOrderItemDto) => !isManualCustomItem(o))
  @IsUUID()
  @IsOptional()
  variantId?: string;

  /**
   * When true (or when productId is omitted), treat as an unlisted/custom line.
   */
  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;

  /** Display name for custom/unlisted items. */
  @ValidateIf((o: ManualOrderItemDto) => isManualCustomItem(o))
  @IsString()
  @IsNotEmpty()
  title?: string;

  /**
   * Unit price for custom items (required).
   * Catalog lines continue to use customUnitPrice for optional overrides.
   */
  @ValidateIf((o: ManualOrderItemDto) => isManualCustomItem(o))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  /** Unit weight in kg for custom items (defaults to 1 on the server). */
  @ValidateIf((o: ManualOrderItemDto) => isManualCustomItem(o))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_MANUAL_ITEM_QUANTITY)
  quantity: number;

  /** When set on a catalog line, charged instead of the catalog unit price. */
  @ValidateIf((o: ManualOrderItemDto) => !isManualCustomItem(o))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  customUnitPrice?: number;
}

export class CreateManualOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ManualOrderItemDto)
  items: ManualOrderItemDto[];

  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  customerGroupId?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsString()
  @IsOptional()
  notes?: string;

  /** When set (including 0), replaces standard Karachi/outstation delivery calculation. */
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  customDeliveryFee?: number;

  /** Order-level discount applied against subtotal. */
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  customDiscount?: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  currency?: string;

  /** COD or bank transfer — stored on order metadata for labels/invoices. */
  @IsOptional()
  @IsIn(MANUAL_ORDER_PAYMENT_METHODS)
  paymentMethod?: (typeof MANUAL_ORDER_PAYMENT_METHODS)[number];

  /**
   * When true (default), attach a WhatsApp confirmation payload to metadata
   * and rely on order.domain.created notification handlers.
   */
  @IsOptional()
  @IsBoolean()
  sendWhatsappConfirmation?: boolean;
}

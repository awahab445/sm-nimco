import { IsString, IsIn, IsOptional } from 'class-validator';
import { ORDER_STATUS_VALUES } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  /** Optional so fulfillment-only updates (e.g. mark ready) cannot force orderStatus. */
  @IsString()
  @IsOptional()
  @IsIn(ORDER_STATUS_VALUES)
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'paid', 'failed', 'refunded'])
  paymentStatus?: string;

  @IsString()
  @IsOptional()
  @IsIn([
    'unfulfilled',
    'partially_fulfilled',
    'fulfilled',
    'shipped',
    'delivered',
  ])
  fulfillmentStatus?: string;
}

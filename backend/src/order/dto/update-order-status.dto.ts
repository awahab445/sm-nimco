import { IsString, IsIn, IsOptional } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['pending', 'processing', 'completed', 'cancelled'])
  status: string;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'paid', 'failed', 'refunded'])
  paymentStatus?: string;

  @IsString()
  @IsOptional()
  @IsIn(['unfulfilled', 'partially_fulfilled', 'fulfilled', 'shipped', 'delivered'])
  fulfillmentStatus?: string;
}


import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ORDER_STATUS_VALUES } from '../enums/order-status.enum';

export class OrderQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  @IsIn(ORDER_STATUS_VALUES)
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'paid', 'failed', 'refunded'])
  paymentStatus?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(500)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'grandTotal'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

import { IsIn, IsString } from 'class-validator';
import { VENDOR_ORDER_STATUSES } from '../utils/vendor-order-status.util';

export class VendorOrderQueryDto {
  @IsString()
  @IsIn([...VENDOR_ORDER_STATUSES])
  status: (typeof VENDOR_ORDER_STATUSES)[number];
}

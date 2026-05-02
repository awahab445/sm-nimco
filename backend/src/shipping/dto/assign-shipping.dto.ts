import { IsString, IsNotEmpty } from 'class-validator';

export class AssignShippingDto {
  @IsString()
  @IsNotEmpty()
  shippingMethodId: string;
}

import { IsOptional } from 'class-validator';

export class UpdateShippingStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  trackingUrl?: string;
}


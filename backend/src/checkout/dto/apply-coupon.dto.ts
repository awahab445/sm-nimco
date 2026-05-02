import { IsString, IsOptional } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  @IsOptional()
  couponCode?: string;
}

import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentFlowType, PaymentProviderCode } from '../types/payment.types';

export class CreateAdminPaymentMethodDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(PaymentProviderCode)
  provider: PaymentProviderCode;

  @IsEnum(PaymentFlowType)
  flowType: PaymentFlowType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

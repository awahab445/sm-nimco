import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUUID,
  IsObject,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class ConfirmCheckoutDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  customerGroupId?: string;

  @IsString()
  @IsNotEmpty()
  paymentMethodCode: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ValidateIf((o) => o.returnUrl != null && o.returnUrl !== '')
  @IsUrl({
    require_protocol: true,
    protocols: ['http', 'https'],
    require_tld: false,
  })
  @IsOptional()
  returnUrl?: string;

  @ValidateIf((o) => o.cancelUrl != null && o.cancelUrl !== '')
  @IsUrl({
    require_protocol: true,
    protocols: ['http', 'https'],
    require_tld: false,
  })
  @IsOptional()
  cancelUrl?: string;
}

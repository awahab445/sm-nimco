import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminPaymentMethodDto } from './create-admin-payment-method.dto';

export class UpdateAdminPaymentMethodDto extends PartialType(
  CreateAdminPaymentMethodDto,
) {}

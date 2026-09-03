import { ForbiddenException } from '@nestjs/common';
import type {
  JwtValidatePayload,
  VendorJwtPayload,
} from '../../auth/strategies/jwt.strategy';

export function assertVendorUser(
  user: JwtValidatePayload,
): asserts user is VendorJwtPayload {
  if (user.typ !== 'vendor') {
    throw new ForbiddenException('Store operator session required');
  }
}

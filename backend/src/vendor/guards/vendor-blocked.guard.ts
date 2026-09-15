import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';
import { USER_BLOCKED_MESSAGE } from '../../sessions/session.service';

/**
 * Blocks vendor API access when AdminUser.isBlocked is true.
 * Apply on all authenticated `/vendor/*` controllers.
 */
@Injectable()
export class VendorBlockedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: JwtValidatePayload;
    }>();
    const user = request.user;
    if (!user || user.typ !== 'vendor') {
      return true;
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: user.vendorUserId },
      select: { isBlocked: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      throw new ForbiddenException('Store operator session required');
    }

    if (admin.isBlocked) {
      throw new ForbiddenException({ message: USER_BLOCKED_MESSAGE });
    }

    return true;
  }
}

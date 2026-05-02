import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { AdminRbacService } from '../services/admin-rbac.service';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';

@Injectable()
export class AdminPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbac: AdminRbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(ADMIN_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ user: JwtValidatePayload }>();
    const user = req.user;
    if (!user || user.typ !== 'admin') {
      throw new ForbiddenException('Admin session required');
    }

    const ok = await this.rbac.userHasAllPermissions(user.adminUserId, required);
    if (!ok) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}

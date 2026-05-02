import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';

export const CurrentAdminId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const user = ctx.switchToHttp().getRequest<{ user: JwtValidatePayload }>().user;
    if (!user || user.typ !== 'admin') {
      throw new UnauthorizedException('Admin session required');
    }
    return user.adminUserId;
  },
);

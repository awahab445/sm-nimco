import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtValidatePayload } from '../strategies/jwt.strategy';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT must represent a storefront customer, not an admin.
 */
@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(
    err: unknown,
    user: JwtValidatePayload | false,
    _info: unknown,
    _context: ExecutionContext,
  ): any {
    if (err || !user) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException('Invalid or missing token');
    }
    if (user.typ !== 'customer') {
      throw new ForbiddenException('Customer session required');
    }
    return user;
  }
}

import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class AdminJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: unknown,
    user: JwtValidatePayload | false,
    _info: unknown,
    _context: ExecutionContext,
  ): any {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException('Invalid or missing token');
    }
    if (user.typ !== 'admin') {
      throw new ForbiddenException('Admin session required');
    }
    return user;
  }
}

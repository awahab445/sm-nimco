import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtValidatePayload } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtValidatePayload | undefined,
    ctx: ExecutionContext,
  ): JwtValidatePayload | string => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: JwtValidatePayload }>();
    const user = request.user;
    if (data) {
      return user[data];
    }
    return user;
  },
);

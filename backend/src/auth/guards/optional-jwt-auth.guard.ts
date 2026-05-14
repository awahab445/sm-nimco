import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, isObservable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

/** Attaches JWT user when a valid token is present; does not reject anonymous requests. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return await result;
      }
      if (isObservable(result)) {
        return await firstValueFrom(result);
      }
      return result;
    } catch {
      return true;
    }
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser | null {
    if (err) {
      return null;
    }
    return user ?? null;
  }
}

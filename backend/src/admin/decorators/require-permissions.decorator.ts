import { SetMetadata } from '@nestjs/common';

export const ADMIN_PERMISSIONS_KEY = 'adminPermissions';

/** All listed permissions are required (AND). */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(ADMIN_PERMISSIONS_KEY, permissions);

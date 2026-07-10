import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminPermissionsGuard } from './admin-permissions.guard';
import { AdminRbacService } from '../services/admin-rbac.service';
import { ADMIN_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

describe('AdminPermissionsGuard', () => {
  let guard: AdminPermissionsGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let rbac: { userHasAllPermissions: jest.Mock };

  const createContext = (user: { typ: string; adminUserId: string } | null) =>
    ({
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as Parameters<AdminPermissionsGuard['canActivate']>[0];

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };
    rbac = { userHasAllPermissions: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPermissionsGuard,
        { provide: Reflector, useValue: reflector },
        { provide: AdminRbacService, useValue: rbac },
      ],
    }).compile();

    guard = module.get(AdminPermissionsGuard);
  });

  it('allows when no permissions metadata', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ok = await guard.canActivate(
      createContext({ typ: 'admin', adminUserId: 'u1' }),
    );
    expect(ok).toBe(true);
    expect(rbac.userHasAllPermissions).not.toHaveBeenCalled();
  });

  it('allows when metadata is empty array', async () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const ok = await guard.canActivate(
      createContext({ typ: 'admin', adminUserId: 'u1' }),
    );
    expect(ok).toBe(true);
  });

  it('throws when user is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(['products.read']);
    await expect(guard.canActivate(createContext(null))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('throws when user is not admin type', async () => {
    reflector.getAllAndOverride.mockReturnValue(['products.read']);
    await expect(
      guard.canActivate(createContext({ typ: 'customer', adminUserId: 'u1' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delegates to rbac.userHasAllPermissions for admin', async () => {
    reflector.getAllAndOverride.mockReturnValue([
      'products.read',
      'products.update',
    ]);
    rbac.userHasAllPermissions.mockResolvedValue(true);
    const ok = await guard.canActivate(
      createContext({ typ: 'admin', adminUserId: 'user-uuid' }),
    );
    expect(ok).toBe(true);
    expect(rbac.userHasAllPermissions).toHaveBeenCalledWith('user-uuid', [
      'products.read',
      'products.update',
    ]);
  });

  it('throws Forbidden when rbac returns false', async () => {
    reflector.getAllAndOverride.mockReturnValue(['products.read']);
    rbac.userHasAllPermissions.mockResolvedValue(false);
    await expect(
      guard.canActivate(createContext({ typ: 'admin', adminUserId: 'u1' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('passes ADMIN_PERMISSIONS_KEY to reflector', async () => {
    reflector.getAllAndOverride.mockReturnValue(['a']);
    rbac.userHasAllPermissions.mockResolvedValue(true);
    await guard.canActivate(createContext({ typ: 'admin', adminUserId: 'u1' }));
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      ADMIN_PERMISSIONS_KEY,
      [expect.any(Function), expect.any(Function)],
    );
  });
});

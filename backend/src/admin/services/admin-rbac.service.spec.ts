import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminRbacService } from './admin-rbac.service';
import { PrismaService } from '../../catalog/services/prisma.service';
import { SUPER_ADMIN_ROLE_SLUG } from '../constants/permissions';

/** Minimal Prisma user shape used by AdminRbacService.userHasPermission */
function makeUser(opts: {
  isActive: boolean;
  roles: Array<{
    role: {
      slug: string;
      permissions: Array<{ permission: { key: string } }>;
    };
  }>;
}) {
  return {
    isActive: opts.isActive,
    roles: opts.roles,
  };
}

describe('AdminRbacService', () => {
  let service: AdminRbacService;
  let prisma: {
    adminUser: { findUnique: jest.Mock };
    adminPermission: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      adminUser: { findUnique: jest.fn() },
      adminPermission: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRbacService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AdminRbacService);
  });

  describe('isSuperAdmin', () => {
    it('returns true when user has super-admin role slug', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [{ role: { slug: SUPER_ADMIN_ROLE_SLUG, permissions: [] } }],
        }),
      );
      await expect(service.isSuperAdmin('user-1')).resolves.toBe(true);
    });

    it('returns false when inactive', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: false,
          roles: [{ role: { slug: SUPER_ADMIN_ROLE_SLUG, permissions: [] } }],
        }),
      );
      await expect(service.isSuperAdmin('user-1')).resolves.toBe(false);
    });

    it('returns false for manager role', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [{ role: { slug: 'manager', permissions: [] } }],
        }),
      );
      await expect(service.isSuperAdmin('user-1')).resolves.toBe(false);
    });
  });

  describe('userHasPermission', () => {
    it('returns false for inactive user', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: false,
          roles: [{ role: { slug: 'manager', permissions: [{ permission: { key: 'products.read' } }] } }],
        }),
      );
      await expect(service.userHasPermission('u1', 'products.read')).resolves.toBe(false);
    });

    it('returns true for exact permission key', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [
            {
              role: {
                slug: 'custom',
                permissions: [{ permission: { key: 'products.read' } }],
              },
            },
          ],
        }),
      );
      await expect(service.userHasPermission('u1', 'products.read')).resolves.toBe(true);
    });

    it('returns true when user has products.manage and key is products.read (wildcard)', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [
            {
              role: {
                slug: 'custom',
                permissions: [{ permission: { key: 'products.manage' } }],
              },
            },
          ],
        }),
      );
      await expect(service.userHasPermission('u1', 'products.read')).resolves.toBe(true);
      await expect(service.userHasPermission('u1', 'products.update')).resolves.toBe(true);
      await expect(service.userHasPermission('u1', 'products.delete')).resolves.toBe(true);
    });

    it('does not treat products.manage as satisfying orders.read', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [
            {
              role: {
                slug: 'custom',
                permissions: [{ permission: { key: 'products.manage' } }],
              },
            },
          ],
        }),
      );
      await expect(service.userHasPermission('u1', 'orders.read')).resolves.toBe(false);
    });

    it('returns true for admin.access.full', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [
            {
              role: {
                slug: 'custom',
                permissions: [{ permission: { key: 'admin.access.full' } }],
              },
            },
          ],
        }),
      );
      await expect(service.userHasPermission('u1', 'products.read')).resolves.toBe(true);
    });

    it('returns true for super-admin role regardless of permissions', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [{ role: { slug: SUPER_ADMIN_ROLE_SLUG, permissions: [] } }],
        }),
      );
      await expect(service.userHasPermission('u1', 'anything.here')).resolves.toBe(true);
    });
  });

  describe('userHasAllPermissions', () => {
    it('requires every key', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [
            {
              role: {
                slug: 'custom',
                permissions: [{ permission: { key: 'products.read' } }],
              },
            },
          ],
        }),
      );
      await expect(service.userHasAllPermissions('u1', ['products.read'])).resolves.toBe(true);
      await expect(
        service.userHasAllPermissions('u1', ['products.read', 'orders.read']),
      ).resolves.toBe(false);
    });
  });

  describe('checkPermission', () => {
    it('throws UnauthorizedException when adminUserId is null', async () => {
      await expect(service.checkPermission(null, 'products', 'read')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws ForbiddenException when permission missing', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [
            {
              role: {
                slug: 'custom',
                permissions: [{ permission: { key: 'orders.read' } }],
              },
            },
          ],
        }),
      );
      await expect(service.checkPermission('u1', 'products', 'read')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.checkPermission('u1', 'products', 'read')).rejects.toThrow(
        /Missing permission: products\.read/,
      );
    });

    it('resolves when entity.action is granted via manage wildcard', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [
            {
              role: {
                slug: 'custom',
                permissions: [{ permission: { key: 'products.manage' } }],
              },
            },
          ],
        }),
      );
      await expect(service.checkPermission('u1', 'products', 'read')).resolves.toBeUndefined();
    });
  });

  describe('getEffectivePermissionKeys', () => {
    it('returns empty array for inactive user', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: false,
          roles: [{ role: { slug: 'manager', permissions: [{ permission: { key: 'products.read' } }] } }],
        }),
      );
      await expect(service.getEffectivePermissionKeys('u1')).resolves.toEqual([]);
    });

    it('returns all permission keys from DB for super-admin', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [{ role: { slug: SUPER_ADMIN_ROLE_SLUG, permissions: [] } }],
        }),
      );
      prisma.adminPermission.findMany.mockResolvedValue([
        { key: 'a' },
        { key: 'b' },
      ]);
      await expect(service.getEffectivePermissionKeys('u1')).resolves.toEqual(['a', 'b']);
    });

    it('returns deduped explicit keys for non-super user', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(
        makeUser({
          isActive: true,
          roles: [
            {
              role: {
                slug: 'r1',
                permissions: [
                  { permission: { key: 'products.read' } },
                  { permission: { key: 'orders.read' } },
                ],
              },
            },
            {
              role: {
                slug: 'r2',
                permissions: [{ permission: { key: 'products.read' } }],
              },
            },
          ],
        }),
      );
      const keys = await service.getEffectivePermissionKeys('u1');
      expect(keys.sort()).toEqual(['orders.read', 'products.read']);
      expect(prisma.adminPermission.findMany).not.toHaveBeenCalled();
    });
  });
});

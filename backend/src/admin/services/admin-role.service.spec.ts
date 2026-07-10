import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminRoleService } from './admin-role.service';
import { AdminRbacService } from './admin-rbac.service';
import { PrismaService } from '../../catalog/services/prisma.service';
import { SUPER_ADMIN_ROLE_SLUG } from '../constants/permissions';

describe('AdminRoleService', () => {
  let service: AdminRoleService;
  let prisma: {
    adminRole: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
    adminPermission: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      upsert: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let rbac: { isSuperAdmin: jest.Mock };

  beforeEach(async () => {
    rbac = { isSuperAdmin: jest.fn() };

    prisma = {
      adminRole: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      adminPermission: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRoleService,
        { provide: PrismaService, useValue: prisma },
        { provide: AdminRbacService, useValue: rbac },
      ],
    }).compile();

    service = module.get(AdminRoleService);
  });

  describe('remove', () => {
    const roleId = '11111111-1111-1111-1111-111111111111';
    const actorId = '22222222-2222-2222-2222-222222222222';

    it('throws NotFoundException when role missing', async () => {
      prisma.adminRole.findUnique.mockResolvedValue(null);
      await expect(service.remove(roleId, actorId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('forbids non-super from deleting system role', async () => {
      rbac.isSuperAdmin.mockResolvedValue(false);
      prisma.adminRole.findUnique.mockResolvedValue({
        id: roleId,
        slug: 'manager',
        isSystem: true,
        _count: { users: 0 },
      });
      await expect(service.remove(roleId, actorId)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('forbids non-super from deleting role assigned to users', async () => {
      rbac.isSuperAdmin.mockResolvedValue(false);
      prisma.adminRole.findUnique.mockResolvedValue({
        id: roleId,
        slug: 'custom',
        isSystem: false,
        _count: { users: 2 },
      });
      await expect(service.remove(roleId, actorId)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('allows non-super to delete empty custom role', async () => {
      rbac.isSuperAdmin.mockResolvedValue(false);
      prisma.adminRole.findUnique.mockResolvedValue({
        id: roleId,
        slug: 'custom',
        isSystem: false,
        _count: { users: 0 },
      });
      prisma.adminRole.delete.mockResolvedValue({});
      await expect(service.remove(roleId, actorId)).resolves.toEqual({
        id: roleId,
        deleted: true,
        slug: 'custom',
        wasSystem: false,
      });
      expect(prisma.adminRole.delete).toHaveBeenCalledWith({
        where: { id: roleId },
      });
    });

    it('allows super-admin to delete system role with users assigned', async () => {
      rbac.isSuperAdmin.mockResolvedValue(true);
      prisma.adminRole.findUnique.mockResolvedValue({
        id: roleId,
        slug: SUPER_ADMIN_ROLE_SLUG,
        isSystem: true,
        _count: { users: 5 },
      });
      prisma.adminRole.delete.mockResolvedValue({});
      await expect(service.remove(roleId, actorId)).resolves.toMatchObject({
        deleted: true,
        slug: SUPER_ADMIN_ROLE_SLUG,
        wasSystem: true,
      });
    });
  });

  describe('removePermission', () => {
    it('forbids non-super-admin', async () => {
      rbac.isSuperAdmin.mockResolvedValue(false);
      await expect(
        service.removePermission('products.read', 'actor-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.adminPermission.findUnique).not.toHaveBeenCalled();
    });

    it('throws NotFound when permission row missing', async () => {
      rbac.isSuperAdmin.mockResolvedValue(true);
      prisma.adminPermission.findUnique.mockResolvedValue(null);
      await expect(
        service.removePermission('missing.key', 'actor-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deletes permission and returns role link count', async () => {
      rbac.isSuperAdmin.mockResolvedValue(true);
      prisma.adminPermission.findUnique.mockResolvedValue({
        id: 'perm-1',
        key: 'temp.test',
        _count: { roles: 3 },
      });
      prisma.adminPermission.delete.mockResolvedValue({});
      await expect(
        service.removePermission('temp.test', 'actor-1'),
      ).resolves.toEqual({
        key: 'temp.test',
        deleted: true,
        roleLinksRemoved: 3,
      });
      expect(prisma.adminPermission.delete).toHaveBeenCalledWith({
        where: { key: 'temp.test' },
      });
    });
  });

  describe('create', () => {
    it('rejects slug equal to super-admin', async () => {
      await expect(
        service.create({
          slug: SUPER_ADMIN_ROLE_SLUG,
          name: 'Fake',
          permissionKeys: [],
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects duplicate slug', async () => {
      prisma.adminRole.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({
          slug: 'duplicate',
          name: 'Dup',
          permissionKeys: [],
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('upserts newPermissions then creates role with resolved ids', async () => {
      prisma.adminRole.findUnique.mockResolvedValue(null);
      prisma.adminPermission.upsert.mockResolvedValue({});
      prisma.adminPermission.findMany.mockResolvedValue([
        { id: 'p1', key: 'products.read' },
        { id: 'p2', key: 'custom.new' },
      ]);
      prisma.adminRole.create.mockResolvedValue({
        id: 'new-role',
        slug: 'test-role',
        name: 'Test',
        description: null,
        isSystem: false,
        permissions: [],
      });

      await service.create({
        slug: 'test-role',
        name: 'Test',
        permissionKeys: ['products.read'],
        newPermissions: [{ key: 'custom.new', description: 'x' }],
      });

      expect(prisma.adminPermission.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'custom.new' },
          create: expect.objectContaining({ key: 'custom.new' }),
        }),
      );
      expect(prisma.adminPermission.findMany).toHaveBeenCalledWith({
        where: {
          key: { in: expect.arrayContaining(['products.read', 'custom.new']) },
        },
        select: { id: true, key: true },
      });
      expect(prisma.adminRole.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const roleId = '33333333-3333-3333-3333-333333333333';

    it('throws when super-admin role receives permissionKeys', async () => {
      prisma.adminRole.findUnique.mockResolvedValue({
        id: roleId,
        slug: SUPER_ADMIN_ROLE_SLUG,
        isSystem: true,
      });
      await expect(
        service.update(roleId, { permissionKeys: ['products.read'] }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('runs transaction when permissionKeys provided', async () => {
      prisma.adminRole.findUnique.mockResolvedValue({
        id: roleId,
        slug: 'custom',
        isSystem: false,
      });
      prisma.adminPermission.findMany.mockResolvedValue([
        { id: 'p1', key: 'products.read' },
      ]);
      const tx = {
        adminRole: {
          update: jest.fn().mockResolvedValue({}),
          findUniqueOrThrow: jest.fn().mockResolvedValue({
            id: roleId,
            slug: 'custom',
            name: 'Updated',
            description: null,
            isSystem: false,
            permissions: [],
          }),
        },
        adminRolePermission: {
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      };
      prisma.$transaction.mockImplementation(
        async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
      );

      const result = await service.update(roleId, {
        name: 'Updated',
        permissionKeys: ['products.read'],
      });

      expect(tx.adminRolePermission.deleteMany).toHaveBeenCalledWith({
        where: { roleId },
      });
      expect(tx.adminRolePermission.createMany).toHaveBeenCalled();
      expect(result.slug).toBe('custom');
    });
  });

  describe('resolvePermissionIds (via create missing keys)', () => {
    it('throws BadRequestException when a key is unknown after upsert', async () => {
      prisma.adminRole.findUnique.mockResolvedValue(null);
      prisma.adminPermission.upsert.mockResolvedValue({});
      prisma.adminPermission.findMany.mockResolvedValue([
        { id: 'p1', key: 'products.read' },
      ]);

      await expect(
        service.create({
          slug: 'bad',
          name: 'Bad',
          permissionKeys: ['products.read', 'totally.missing'],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});

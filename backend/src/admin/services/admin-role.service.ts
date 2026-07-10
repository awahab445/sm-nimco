import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { AdminRbacService } from './admin-rbac.service';
import { CreateAdminRoleDto } from '../dto/create-admin-role.dto';
import { UpdateAdminRoleDto } from '../dto/update-admin-role.dto';
import { NewPermissionDto } from '../dto/new-permission.dto';
import { SUPER_ADMIN_ROLE_SLUG } from '../constants/permissions';

const ROLE_INCLUDE = {
  permissions: {
    select: {
      permission: { select: { key: true, description: true } },
    },
  },
} as const;

@Injectable()
export class AdminRoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbac: AdminRbacService,
  ) {}

  async list() {
    return this.prisma.adminRole.findMany({
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        isSystem: true,
        permissions: {
          select: {
            permission: { select: { key: true, description: true } },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.adminRole.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        isSystem: true,
        ...ROLE_INCLUDE,
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async listAllPermissionKeys() {
    const perms = await this.prisma.adminPermission.findMany({
      orderBy: { key: 'asc' },
      select: {
        id: true,
        key: true,
        description: true,
        _count: { select: { roles: true } },
      },
    });
    return perms.map((p) => ({
      id: p.id,
      key: p.key,
      description: p.description,
      /** Number of roles currently granting this permission. */
      roleCount: p._count.roles,
    }));
  }

  async create(dto: CreateAdminRoleDto) {
    if (dto.slug === SUPER_ADMIN_ROLE_SLUG) {
      throw new ForbiddenException(
        `Cannot create another '${SUPER_ADMIN_ROLE_SLUG}' role.`,
      );
    }
    const existing = await this.prisma.adminRole.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(
        `Role with slug '${dto.slug}' already exists.`,
      );
    }

    // Upsert any newly-minted permission keys first so they exist in the
    // catalog by the time we resolve the role's permission set.
    await this.upsertCustomPermissions(dto.newPermissions);

    const allKeys = this.mergeKeyLists(dto.permissionKeys, dto.newPermissions);
    const permissionIds = await this.resolvePermissionIds(allKeys);

    const role = await this.prisma.adminRole.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        description: dto.description ?? null,
        isSystem: false,
        permissions: {
          createMany: {
            data: permissionIds.map((permissionId) => ({ permissionId })),
          },
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        isSystem: true,
        ...ROLE_INCLUDE,
      },
    });

    return role;
  }

  async update(id: string, dto: UpdateAdminRoleDto) {
    const role = await this.prisma.adminRole.findUnique({
      where: { id },
      select: { id: true, slug: true, isSystem: true },
    });
    if (!role) throw new NotFoundException('Role not found');

    const isSuper = role.slug === SUPER_ADMIN_ROLE_SLUG;

    if (isSuper && dto.permissionKeys) {
      throw new ForbiddenException(
        "The 'super-admin' role's permissions are managed by the seed and cannot be edited.",
      );
    }

    const data: { name?: string; description?: string | null } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined)
      data.description = dto.description || null;

    // Mint any new permission keys first so the subsequent `permissionKeys`
    // resolve cleanly. Done even when `permissionKeys` is omitted, since the
    // caller may want to expand the catalog without changing the role.
    await this.upsertCustomPermissions(dto.newPermissions);

    const permissionIds = dto.permissionKeys
      ? await this.resolvePermissionIds(
          this.mergeKeyLists(dto.permissionKeys, dto.newPermissions),
        )
      : null;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.adminRole.update({ where: { id }, data });
      }
      if (permissionIds) {
        await tx.adminRolePermission.deleteMany({ where: { roleId: id } });
        if (permissionIds.length > 0) {
          await tx.adminRolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
          });
        }
      }
      return tx.adminRole.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          isSystem: true,
          ...ROLE_INCLUDE,
        },
      });
    });

    return updated;
  }

  /**
   * Delete a role.
   *
   * Default policy (any `admin.roles.manage` holder):
   *   - System roles (super-admin / manager / support) are protected.
   *   - Roles still assigned to users are protected (409 with count).
   *
   * Super-admin actors get **full control** and bypass both protections — the
   * `AdminUserRole` join table cascade-deletes assignments automatically.
   * The seed (`ensureAdminRbacSeeded`) can recreate system roles on next run.
   *
   * Note: deleting the super-admin role removes the slug super-admin bypass
   * for **every** user that held it. The actor will lose privileged access on
   * their next request unless another super-admin remains and re-grants it.
   */
  async remove(id: string, actorId: string) {
    const role = await this.prisma.adminRole.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        isSystem: true,
        _count: { select: { users: true } },
      },
    });
    if (!role) throw new NotFoundException('Role not found');

    const actorIsSuper = await this.rbac.isSuperAdmin(actorId);

    if (!actorIsSuper) {
      if (role.isSystem) {
        throw new ForbiddenException(
          `Cannot delete system role '${role.slug}'. System roles are managed by the seed. Ask a super-admin if you need this removed.`,
        );
      }
      if (role._count.users > 0) {
        throw new ConflictException(
          `Cannot delete role '${role.slug}' — it is assigned to ${role._count.users} user(s). Remove it from those users first.`,
        );
      }
    }

    await this.prisma.adminRole.delete({ where: { id } });
    return { id, deleted: true, slug: role.slug, wasSystem: role.isSystem };
  }

  /**
   * Delete a permission row from the catalog. The `admin_role_permissions`
   * link table cascades on `permissionId`, so every role that currently grants
   * this key loses it automatically.
   *
   * Restricted to super-admin: this is a catalog-wide destructive operation
   * (unticking a perm on a role only revokes it for that role). Note that
   * seeded keys (e.g. `admin.users.read`, `products.update`) are also
   * referenced by `@CheckPermission(...)` decorators in code, so removing them
   * effectively locks every non-super-admin out of those routes until the
   * seed is re-run — the UI surfaces a generic warning with the role-grant
   * count so the operator can make an informed call.
   */
  async removePermission(key: string, actorId: string) {
    const isSuper = await this.rbac.isSuperAdmin(actorId);
    if (!isSuper) {
      throw new ForbiddenException(
        'Only super-admins can delete a permission from the catalog. ' +
          'Untick the permission on a role to revoke it for that role only.',
      );
    }

    const perm = await this.prisma.adminPermission.findUnique({
      where: { key },
      select: {
        id: true,
        key: true,
        _count: { select: { roles: true } },
      },
    });
    if (!perm) {
      throw new NotFoundException(`Permission '${key}' not found`);
    }

    await this.prisma.adminPermission.delete({ where: { key } });

    return {
      key: perm.key,
      deleted: true,
      roleLinksRemoved: perm._count.roles,
    };
  }

  private async resolvePermissionIds(keys: string[]): Promise<string[]> {
    if (keys.length === 0) return [];
    const perms = await this.prisma.adminPermission.findMany({
      where: { key: { in: keys } },
      select: { id: true, key: true },
    });
    if (perms.length !== keys.length) {
      const found = new Set(perms.map((p) => p.key));
      const missing = keys.filter((k) => !found.has(k));
      throw new BadRequestException(
        `Unknown permission key(s): ${missing.join(', ')}. ` +
          `Mint them via the "newPermissions" field or seed them first.`,
      );
    }
    return perms.map((p) => p.id);
  }

  /**
   * Upsert any newly-minted permission entries so they exist in the catalog
   * before we resolve a role's permission set. When `description` is omitted
   * on update we leave any existing description untouched.
   */
  private async upsertCustomPermissions(
    items: NewPermissionDto[] | undefined,
  ): Promise<void> {
    if (!items?.length) return;
    for (const item of items) {
      await this.prisma.adminPermission.upsert({
        where: { key: item.key },
        update:
          item.description !== undefined
            ? { description: item.description }
            : {},
        create: {
          key: item.key,
          description: item.description ?? null,
        },
      });
    }
  }

  /** De-duplicated union of `permissionKeys` and `newPermissions[].key`. */
  private mergeKeyLists(
    existing: string[] | undefined,
    fresh: NewPermissionDto[] | undefined,
  ): string[] {
    const set = new Set<string>(existing ?? []);
    for (const p of fresh ?? []) set.add(p.key);
    return Array.from(set);
  }
}

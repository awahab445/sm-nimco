import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { SUPER_ADMIN_ROLE_SLUG } from '../constants/permissions';

@Injectable()
export class AdminRbacService {
  constructor(private readonly prisma: PrismaService) {}

  async userHasPermission(adminUserId: string, permissionKey: string): Promise<boolean> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user?.isActive) {
      return false;
    }

    for (const ur of user.roles) {
      if (ur.role.slug === SUPER_ADMIN_ROLE_SLUG) {
        return true;
      }
      for (const rp of ur.role.permissions) {
        const key = rp.permission.key;
        if (key === '*' || key === 'admin.access.full') {
          return true;
        }
        if (key === permissionKey) {
          return true;
        }
      }
    }

    return false;
  }

  async userHasAllPermissions(adminUserId: string, keys: string[]): Promise<boolean> {
    for (const k of keys) {
      if (!(await this.userHasPermission(adminUserId, k))) {
        return false;
      }
    }
    return true;
  }

  /** Flat list of permission keys for the user (for /me). Super-admin returns all seeded keys is heavy — return role slugs + explicit keys. */
  async getEffectivePermissionKeys(adminUserId: string): Promise<string[]> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user?.isActive) {
      return [];
    }

    const keys = new Set<string>();
    let isSuper = false;

    for (const ur of user.roles) {
      if (ur.role.slug === SUPER_ADMIN_ROLE_SLUG) {
        isSuper = true;
        break;
      }
      for (const rp of ur.role.permissions) {
        const k = rp.permission.key;
        if (k === '*' || k === 'admin.access.full') {
          isSuper = true;
          break;
        }
        keys.add(k);
      }
      if (isSuper) break;
    }

    if (isSuper) {
      const all = await this.prisma.adminPermission.findMany({ select: { key: true } });
      return all.map((p) => p.key);
    }

    return [...keys];
  }
}

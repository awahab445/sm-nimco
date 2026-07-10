import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { SUPER_ADMIN_ROLE_SLUG } from '../constants/permissions';
import { buildPermissionKey } from '../decorators/check-permission.decorator';

/**
 * If the requested key is `<entity>.<action>` and `action !== 'manage'`,
 * return the corresponding `<entity>.manage` wildcard key. Returns `null` if
 * the requested key already _is_ `.manage`, has no dot, or only one segment.
 *
 * Convention: holding `<entity>.manage` satisfies every `<entity>.<action>`
 * check for that same entity, so callers don't have to enumerate CRUD keys.
 */
function manageWildcardFor(key: string): string | null {
  const lastDot = key.lastIndexOf('.');
  if (lastDot <= 0) return null;
  const action = key.slice(lastDot + 1);
  if (!action || action === 'manage') return null;
  return `${key.slice(0, lastDot)}.manage`;
}

@Injectable()
export class AdminRbacService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Programmatic permission check for service-layer code where the entity/action
   * are dynamic. Throws `403 Forbidden` if the user lacks the permission, or
   * `401 Unauthorized` if no admin id is supplied (e.g., anonymous request).
   *
   * Prefer the `@CheckPermission(entity, action)` controller decorator when the
   * required permission is known statically.
   */
  async checkPermission(
    adminUserId: string | null | undefined,
    entity: string,
    action: string,
  ): Promise<void> {
    if (!adminUserId) {
      throw new UnauthorizedException('Admin session required');
    }
    const key = buildPermissionKey(entity, action);
    const ok = await this.userHasPermission(adminUserId, key);
    if (!ok) {
      throw new ForbiddenException(`Missing permission: ${key}`);
    }
  }

  /** True if the user holds the super-admin role (slug match). */
  async isSuperAdmin(adminUserId: string): Promise<boolean> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      select: {
        isActive: true,
        roles: { select: { role: { select: { slug: true } } } },
      },
    });
    if (!user || !user.isActive) return false;
    return user.roles.some((r) => r.role.slug === SUPER_ADMIN_ROLE_SLUG);
  }

  async userHasPermission(
    adminUserId: string,
    permissionKey: string,
  ): Promise<boolean> {
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

    // Convention: holding `<entity>.manage` satisfies any `<entity>.<action>`
    // check for that entity (mirrors how `customers.manage` already implies
    // customers.read/update/etc on existing routes).
    const manageWildcard = manageWildcardFor(permissionKey);

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
        if (manageWildcard !== null && key === manageWildcard) {
          return true;
        }
      }
    }

    return false;
  }

  async userHasAllPermissions(
    adminUserId: string,
    keys: string[],
  ): Promise<boolean> {
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
      const all = await this.prisma.adminPermission.findMany({
        select: { key: true },
      });
      return all.map((p) => p.key);
    }

    return [...keys];
  }
}

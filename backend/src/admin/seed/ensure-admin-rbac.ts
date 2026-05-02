import type { PrismaClient } from '@prisma/client';
import {
  ADMIN_PERMISSION_SEED,
  SUPER_ADMIN_ROLE_SLUG,
  MANAGER_ROLE_SLUG,
  SUPPORT_ROLE_SLUG,
  MANAGER_PERMISSION_KEYS,
  SUPPORT_PERMISSION_KEYS,
} from '../constants/permissions';

/**
 * Idempotent: upserts permissions, system roles, and role–permission links.
 * Safe to call from `prisma db seed` and from bootstrap when roles are missing.
 */
export async function ensureAdminRbacSeeded(prisma: PrismaClient): Promise<void> {
  for (const p of ADMIN_PERMISSION_SEED) {
    await prisma.adminPermission.upsert({
      where: { key: p.key },
      update: { description: p.description },
      create: { key: p.key, description: p.description },
    });
  }

  const superRole = await prisma.adminRole.upsert({
    where: { slug: SUPER_ADMIN_ROLE_SLUG },
    update: {
      name: 'Super Admin',
      description: 'Full platform access. Assign sparingly.',
    },
    create: {
      slug: SUPER_ADMIN_ROLE_SLUG,
      name: 'Super Admin',
      description: 'Full platform access. Assign sparingly.',
      isSystem: true,
    },
  });

  const managerRole = await prisma.adminRole.upsert({
    where: { slug: MANAGER_ROLE_SLUG },
    update: {
      name: 'Operations Manager',
      description: 'Day-to-day commerce operations without user/role administration.',
    },
    create: {
      slug: MANAGER_ROLE_SLUG,
      name: 'Operations Manager',
      description: 'Day-to-day commerce operations without user/role administration.',
      isSystem: true,
    },
  });

  const supportRole = await prisma.adminRole.upsert({
    where: { slug: SUPPORT_ROLE_SLUG },
    update: {
      name: 'Support',
      description: 'Read-heavy access for customer service.',
    },
    create: {
      slug: SUPPORT_ROLE_SLUG,
      name: 'Support',
      description: 'Read-heavy access for customer service.',
      isSystem: true,
    },
  });

  const allPermIds = await prisma.adminPermission.findMany({ select: { id: true } });
  await prisma.adminRolePermission.deleteMany({ where: { roleId: superRole.id } });
  await prisma.adminRolePermission.createMany({
    data: allPermIds.map(({ id }) => ({ roleId: superRole.id, permissionId: id })),
  });

  async function assignKeysToRole(roleId: string, keys: string[]) {
    const perms = await prisma.adminPermission.findMany({
      where: { key: { in: keys } },
      select: { id: true },
    });
    await prisma.adminRolePermission.deleteMany({ where: { roleId } });
    await prisma.adminRolePermission.createMany({
      data: perms.map(({ id }) => ({ roleId, permissionId: id })),
    });
  }

  await assignKeysToRole(managerRole.id, MANAGER_PERMISSION_KEYS);
  await assignKeysToRole(supportRole.id, SUPPORT_PERMISSION_KEYS);
}

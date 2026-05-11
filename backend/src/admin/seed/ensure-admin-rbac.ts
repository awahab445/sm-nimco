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
  // ---- Rename migration: catalog.* -> products.* --------------------------
  // Historical: `catalog.read` and `catalog.manage` were the coarse keys for
  // products / categories / product-options. They've been collapsed into
  // `products.read` / `products.manage` for naming consistency. To avoid
  // silently revoking access from any custom role currently holding the old
  // keys, promote those grants to the new keys before deleting the legacy
  // permission rows. The function is idempotent: on second run the legacy
  // rows are already gone and the migration becomes a no-op.
  await migrateLegacyCatalogPermissions(prisma);

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

/**
 * For each role that currently holds a legacy `catalog.*` key, ensure the
 * equivalent `products.*` key is granted, then delete the legacy permission
 * rows entirely. The link table's `onDelete: Cascade` on `permissionId`
 * removes the now-redundant grants automatically.
 */
async function migrateLegacyCatalogPermissions(prisma: PrismaClient): Promise<void> {
  const renames: Array<{ oldKey: string; newKey: string; description: string }> = [
    {
      oldKey: 'catalog.read',
      newKey: 'products.read',
      description: 'Read products',
    },
    {
      oldKey: 'catalog.manage',
      newKey: 'products.manage',
      description:
        'Manage products, categories, and product options (implies all products.* actions)',
    },
  ];

  for (const { oldKey, newKey, description } of renames) {
    const oldPerm = await prisma.adminPermission.findUnique({
      where: { key: oldKey },
      select: { id: true },
    });
    if (!oldPerm) continue;

    const newPerm = await prisma.adminPermission.upsert({
      where: { key: newKey },
      update: { description },
      create: { key: newKey, description },
      select: { id: true },
    });

    const rolesHoldingOld = await prisma.adminRolePermission.findMany({
      where: { permissionId: oldPerm.id },
      select: { roleId: true },
    });

    if (rolesHoldingOld.length > 0) {
      await prisma.adminRolePermission.createMany({
        data: rolesHoldingOld.map(({ roleId }) => ({
          roleId,
          permissionId: newPerm.id,
        })),
        skipDuplicates: true,
      });
    }

    await prisma.adminPermission.delete({ where: { id: oldPerm.id } });
  }
}

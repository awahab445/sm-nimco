import { PrismaClient } from '@prisma/client';
import { ensureAdminRbacSeeded } from '../src/admin/seed/ensure-admin-rbac';

const prisma = new PrismaClient();

async function main() {
  // 1. Default shipping zone (applies to all addresses when coverage is empty)
  const defaultZone = await prisma.shippingZone.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Default',
      description: 'Default zone for all addresses',
      coverage: {},
      priority: 0,
      isActive: true,
      metadata: {},
    },
  });

  // 2. Standard Shipping method - 99 PKR
  await prisma.shippingMethod.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {
      name: 'Standard Shipping',
      description: 'Standard delivery',
      type: 'flat_rate',
      config: { cost: 99 },
      isActive: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      zoneId: defaultZone.id,
      code: 'standard',
      name: 'Standard Shipping',
      description: 'Standard delivery - 99 PKR',
      type: 'flat_rate',
      config: { cost: 99 },
      priority: 0,
      isActive: true,
      metadata: {},
    },
  });

  // 3. Cash on Delivery (COD) payment method
  await prisma.paymentMethod.upsert({
    where: { code: 'cod' },
    update: {
      name: 'Cash on Delivery',
      provider: 'cod',
      flowType: 'OFFLINE',
      isActive: true,
    },
    create: {
      code: 'cod',
      name: 'Cash on Delivery',
      provider: 'cod',
      flowType: 'OFFLINE',
      isActive: true,
      config: {},
      metadata: {},
    },
  });

  await ensureAdminRbacSeeded(prisma);
  console.log('Seed: admin RBAC (permissions + super-admin, manager, support roles).');

  console.log('Seed completed: Default shipping zone, Standard Shipping (99 PKR), and COD payment method.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

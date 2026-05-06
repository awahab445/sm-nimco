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

  // 4. CMS: starter page
  await prisma.cmsPage.upsert({
    where: { slug: 'about-us' },
    update: {
      title: 'About Us',
      status: 'published',
      excerpt: 'Learn more about our mission and team.',
      metaTitle: 'About Us',
      metaDescription: 'About our ecommerce store and what we stand for.',
      contentHtml:
        '<h1>About Us</h1><p>We are building a modern ecommerce experience with trusted products and reliable delivery.</p><p>Our mission is simple: quality, transparency, and customer-first service.</p>',
      contentJson: {},
      publishedAt: new Date(),
    },
    create: {
      title: 'About Us',
      slug: 'about-us',
      status: 'published',
      excerpt: 'Learn more about our mission and team.',
      metaTitle: 'About Us',
      metaDescription: 'About our ecommerce store and what we stand for.',
      contentHtml:
        '<h1>About Us</h1><p>We are building a modern ecommerce experience with trusted products and reliable delivery.</p><p>Our mission is simple: quality, transparency, and customer-first service.</p>',
      contentJson: {},
      publishedAt: new Date(),
    },
  });

  // 5. CMS: starter home layout block consumed by frontend/lib/cms/home-page.service.ts
  await prisma.cmsBlock.upsert({
    where: { identifier: 'home-page-layout' },
    update: {
      name: 'Home Page Layout',
      description: 'Structured sections consumed by storefront homepage',
      isActive: true,
      contentHtml: '<p>Home page layout JSON block.</p>',
      contentJson: {
        sections: [
          {
            id: 'hero-main',
            type: 'hero_slider',
            autoplayMs: 5000,
            slides: [
              {
                id: 'hero-1',
                title: 'Welcome to our store',
                subtitle: 'Discover great products and fast delivery',
                imageUrl: '/themes/mehfil-shereen/banner1.jpeg',
                ctaLabel: 'Shop now',
                ctaHref: '/products',
              },
              {
                id: 'hero-2',
                title: 'New arrivals every week',
                subtitle: 'Fresh picks and curated collections',
                imageUrl: '/themes/mehfil-shereen/banner2.jpeg',
                ctaLabel: 'Browse products',
                ctaHref: '/products',
              },
            ],
          },
          {
            id: 'promo-mid',
            type: 'promo_banner',
            tone: 'primary',
            title: 'Members save more',
            subtitle: 'Create your account for exclusive offers.',
            ctaLabel: 'Create account',
            ctaHref: '/register',
          },
          {
            id: 'shelf-featured',
            type: 'product_shelf',
            title: 'Featured picks',
            subtitle: 'Popular right now',
            viewAllHref: '/products',
            source: { kind: 'latest', limit: 8 },
          },
        ],
      },
    },
    create: {
      name: 'Home Page Layout',
      identifier: 'home-page-layout',
      description: 'Structured sections consumed by storefront homepage',
      isActive: true,
      contentHtml: '<p>Home page layout JSON block.</p>',
      contentJson: {
        sections: [
          {
            id: 'hero-main',
            type: 'hero_slider',
            autoplayMs: 5000,
            slides: [
              {
                id: 'hero-1',
                title: 'Welcome to our store',
                subtitle: 'Discover great products and fast delivery',
                imageUrl: '/themes/mehfil-shereen/banner1.jpeg',
                ctaLabel: 'Shop now',
                ctaHref: '/products',
              },
              {
                id: 'hero-2',
                title: 'New arrivals every week',
                subtitle: 'Fresh picks and curated collections',
                imageUrl: '/themes/mehfil-shereen/banner2.jpeg',
                ctaLabel: 'Browse products',
                ctaHref: '/products',
              },
            ],
          },
          {
            id: 'promo-mid',
            type: 'promo_banner',
            tone: 'primary',
            title: 'Members save more',
            subtitle: 'Create your account for exclusive offers.',
            ctaLabel: 'Create account',
            ctaHref: '/register',
          },
          {
            id: 'shelf-featured',
            type: 'product_shelf',
            title: 'Featured picks',
            subtitle: 'Popular right now',
            viewAllHref: '/products',
            source: { kind: 'latest', limit: 8 },
          },
        ],
      },
    },
  });

  // 6. CMS: starter hero slider
  await prisma.cmsBannerSlider.upsert({
    where: { identifier: 'home-hero' },
    update: {
      name: 'Home Hero Slider',
      isActive: true,
      autoplayMs: 5000,
    },
    create: {
      name: 'Home Hero Slider',
      identifier: 'home-hero',
      isActive: true,
      autoplayMs: 5000,
    },
  });

  const slider = await prisma.cmsBannerSlider.findUniqueOrThrow({
    where: { identifier: 'home-hero' },
    select: { id: true },
  });

  await prisma.cmsBannerSlide.deleteMany({ where: { sliderId: slider.id } });
  await prisma.cmsBannerSlide.createMany({
    data: [
      {
        sliderId: slider.id,
        title: 'Shop smarter with confidence',
        subtitle: 'Curated essentials at fair prices.',
        imageUrl: '/themes/mehfil-shereen/banner1.jpeg',
        ctaLabel: 'Shop now',
        ctaHref: '/products',
        sortOrder: 0,
        isActive: true,
      },
      {
        sliderId: slider.id,
        title: 'Track your orders anytime',
        subtitle: 'Real-time updates from checkout to delivery.',
        imageUrl: '/themes/mehfil-shereen/banner2.jpeg',
        ctaLabel: 'Track order',
        ctaHref: '/track-order',
        sortOrder: 1,
        isActive: true,
      },
    ],
  });

  console.log(
    'Seed completed: shipping/payment defaults + CMS starter data (about-us page, home-page-layout block, home-hero slider).',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

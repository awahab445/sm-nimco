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

  // 3b. Storefront PLP filter slots (admin can rename, reorder, toggle, add options)
  const defaultStoreFilters = [
    { code: 'category', name: 'Category', kind: 'CATEGORY', sortOrder: 0 },
    { code: 'price', name: 'Price', kind: 'PRICE', sortOrder: 1 },
    { code: 'brand', name: 'Brand', kind: 'ATTRIBUTE', sortOrder: 2 },
    { code: 'size', name: 'Size', kind: 'ATTRIBUTE', sortOrder: 3 },
  ] as const;
  for (const f of defaultStoreFilters) {
    await prisma.storefrontFilter.upsert({
      where: { code: f.code },
      update: {},
      create: {
        code: f.code,
        name: f.name,
        kind: f.kind,
        sortOrder: f.sortOrder,
        isActive: true,
      },
    });
  }
  console.log('Seed: storefront filter slots (category, price, brand, size).');

  // 3c. Default storefront header navigation (matches migration defaults; safe when db push skips migrations)
  const defaultHeaderNav = [
    { id: '00000000-0000-0000-0000-00000000e001', label: 'Home', href: '/', sortOrder: 0, kind: 'LINK', openMegaMenu: false },
    { id: '00000000-0000-0000-0000-00000000e002', label: 'Products', secondaryLabel: 'Categories', href: '/products', sortOrder: 10, kind: 'MEGA_CATEGORIES', openMegaMenu: true },
    { id: '00000000-0000-0000-0000-00000000e003', label: 'Track order', href: '/track-order', sortOrder: 20, kind: 'LINK', openMegaMenu: false },
    { id: '00000000-0000-0000-0000-00000000e005', label: 'Cart', href: '/cart', sortOrder: 40, kind: 'LINK', openMegaMenu: false },
  ] as const;
  for (const link of defaultHeaderNav) {
    await prisma.storefrontNavLink.upsert({
      where: { id: link.id },
      update: {},
      create: {
        id: link.id,
        label: link.label,
        secondaryLabel: 'secondaryLabel' in link ? link.secondaryLabel : null,
        href: link.href,
        sortOrder: link.sortOrder,
        isActive: true,
        kind: link.kind,
        zone: 'header',
        openMegaMenu: link.openMegaMenu,
      },
    });
  }
  console.log('Seed: default storefront header navigation.');

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

  // 4b. CMS: reusable HTML block placed on the home layout via `cms_block_ref`
  await prisma.cmsBlock.upsert({
    where: { identifier: 'home-inline-teaser' },
    update: {
      name: 'Home inline teaser',
      description: 'Example block embedded in homepage layout by identifier',
      isActive: true,
      contentHtml:
        '<div class="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm"><h2 class="text-lg font-semibold text-foreground">Managed as its own block</h2><p class="mt-2 text-sm text-muted-foreground">This copy lives in the <strong>home-inline-teaser</strong> CMS block. The home layout references it by identifier so you can edit it separately from the layout JSON.</p></div>',
      contentJson: {},
    },
    create: {
      name: 'Home inline teaser',
      identifier: 'home-inline-teaser',
      description: 'Example block embedded in homepage layout by identifier',
      isActive: true,
      contentHtml:
        '<div class="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm"><h2 class="text-lg font-semibold text-foreground">Managed as its own block</h2><p class="mt-2 text-sm text-muted-foreground">This copy lives in the <strong>home-inline-teaser</strong> CMS block. The home layout references it by identifier so you can edit it separately from the layout JSON.</p></div>',
      contentJson: {},
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
            id: 'inline-teaser',
            type: 'cms_block_ref',
            blockIdentifier: 'home-inline-teaser',
          },
          {
            id: 'shelf-featured',
            type: 'product_shelf',
            title: 'Featured picks',
            subtitle: 'Popular right now',
            viewAllHref: '/products',
            source: { kind: 'latest', limit: 8 },
          },
          {
            id: 'subscription',
            type: 'subscription_cta',
            title: 'Stay in the loop',
            subtitle: 'Get product drops and offers by email.',
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
            id: 'inline-teaser',
            type: 'cms_block_ref',
            blockIdentifier: 'home-inline-teaser',
          },
          {
            id: 'shelf-featured',
            type: 'product_shelf',
            title: 'Featured picks',
            subtitle: 'Popular right now',
            viewAllHref: '/products',
            source: { kind: 'latest', limit: 8 },
          },
          {
            id: 'subscription',
            type: 'subscription_cta',
            title: 'Stay in the loop',
            subtitle: 'Get product drops and offers by email.',
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
      slideWidthPx: 1920,
      slideHeightPx: 800,
    },
    create: {
      name: 'Home Hero Slider',
      identifier: 'home-hero',
      isActive: true,
      autoplayMs: 5000,
      slideWidthPx: 1920,
      slideHeightPx: 800,
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

  await prisma.analyticsGa4Settings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', isEnabled: false, currency: 'PKR' },
  });

  console.log('Seed completed: shipping/payment defaults + CMS starter data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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
  await prisma.storefrontNavLink.deleteMany({
    where: {
      OR: [
        { id: '00000000-0000-0000-0000-00000000e001' },
        { href: '/', zone: 'header', label: 'Home' },
      ],
    },
  });
  const defaultHeaderNav = [
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

  // 4. CMS: starter page (create only — never overwrite admin edits on re-seed)
  await prisma.cmsPage.upsert({
    where: { slug: 'about-us' },
    update: {},
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

  const policyPages = [
    {
      slug: 'shipping-returns',
      title: 'Shipping & Returns',
      excerpt: 'Delivery timelines, shipping rates, and return policy.',
      metaDescription: 'Learn about shipping options, delivery times, and how to return items.',
      contentHtml:
        '<h2>Shipping</h2><p>We process orders within 1–2 business days. Standard delivery typically arrives within 3–7 business days depending on your location. Free shipping may apply on qualifying order values — see the announcement bar or checkout for current thresholds.</p><h2>Returns</h2><p>If you receive a damaged or incorrect item, contact us within 7 days of delivery with your order number and photos. Approved returns are refunded or replaced according to our customer care review.</p><h2>Questions</h2><p>For shipping or return help, visit <strong>Track order</strong> or reach out via our contact channels.</p>',
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      excerpt: 'How we collect, use, and protect your personal information.',
      metaDescription: 'Read how we handle your data, cookies, and account information.',
      contentHtml:
        '<h2>Information we collect</h2><p>We collect information you provide when creating an account, placing an order, or contacting support — such as your name, email, phone number, and delivery address.</p><h2>How we use it</h2><p>We use your information to process orders, provide customer support, improve our storefront, and send transactional messages related to your purchases.</p><h2>Data security</h2><p>We apply reasonable technical and organizational measures to protect your data. Payment details are handled by secure payment providers and are not stored on our servers.</p><h2>Your choices</h2><p>You may update account details from your profile or contact us to request access or correction of your personal data where applicable.</p>',
    },
    {
      slug: 'terms-conditions',
      title: 'Terms & Conditions',
      excerpt: 'Terms governing use of our website and purchases.',
      metaDescription: 'Store terms of use, ordering rules, and limitations of liability.',
      contentHtml:
        '<h2>Using our store</h2><p>By browsing or purchasing from this website, you agree to these terms. You must provide accurate information when creating an account or placing an order.</p><h2>Orders &amp; pricing</h2><p>All prices are shown in the store currency unless stated otherwise. We reserve the right to correct pricing errors and to cancel orders affected by such errors before fulfillment.</p><h2>Product information</h2><p>We aim to display accurate descriptions and images. Minor variations in packaging or appearance may occur without notice.</p><h2>Liability</h2><p>To the extent permitted by law, we are not liable for indirect or consequential losses arising from use of the site or delayed delivery beyond our reasonable control.</p>',
    },
  ] as const;

  for (const page of policyPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        title: page.title,
        slug: page.slug,
        status: 'published',
        excerpt: page.excerpt,
        metaTitle: page.title,
        metaDescription: page.metaDescription,
        contentHtml: page.contentHtml,
        contentJson: {},
        publishedAt: new Date(),
      },
    });
  }
  console.log('Seed: policy pages (shipping-returns, privacy-policy, terms-conditions).');

  // 4b. CMS: reusable HTML block placed on the home layout via `cms_block_ref`
  await prisma.cmsBlock.upsert({
    where: { identifier: 'home-inline-teaser' },
    update: {},
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
    update: {},
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

  // 6. CMS: starter hero slider (create only — preserve uploaded slides on re-seed)
  await prisma.cmsBannerSlider.upsert({
    where: { identifier: 'home-hero' },
    update: {},
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

  const existingSlideCount = await prisma.cmsBannerSlide.count({
    where: { sliderId: slider.id },
  });

  if (existingSlideCount === 0) {
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
  }

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

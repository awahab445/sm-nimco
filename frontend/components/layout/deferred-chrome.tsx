'use client';

import dynamic from 'next/dynamic';

const MobileBottomNav = dynamic(
  () =>
    import('@/components/layout/mobile-bottom-nav').then((m) => m.MobileBottomNav),
  { ssr: false },
);

const MobileMiniCartBar = dynamic(
  () =>
    import('@/components/layout/mobile-mini-cart-bar').then((m) => m.MobileMiniCartBar),
  { ssr: false },
);

const WhatsAppWidget = dynamic(
  () => import('@/components/whatsapp-widget').then((m) => m.WhatsAppWidget),
  { ssr: false },
);

const StorefrontToast = dynamic(
  () => import('@/components/storefront-toast').then((m) => m.StorefrontToast),
  { ssr: false },
);

/** Non-critical chrome loaded after hydration to keep mobile TBT down. */
export function DeferredChrome() {
  return (
    <>
      <MobileBottomNav />
      <MobileMiniCartBar />
      <WhatsAppWidget />
      <StorefrontToast />
    </>
  );
}

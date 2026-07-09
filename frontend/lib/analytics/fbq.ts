import type { Ga4PublicConfig } from './types';

let runtimeConfig: Ga4PublicConfig | null = null;

export function setMetaPixelConfig(config: Ga4PublicConfig | null): void {
  runtimeConfig = config;
}

export function isMetaPixelActive(): boolean {
  return Boolean(
    runtimeConfig?.metaPixelEnabled && runtimeConfig.metaPixelId,
  );
}

export function canTrackMeta(
  category: keyof Pick<
    Ga4PublicConfig,
    | 'trackPageViews'
    | 'trackCartEvents'
    | 'trackCheckoutSteps'
    | 'trackPurchases'
    | 'trackRefunds'
    | 'trackCustomEvents'
  >,
): boolean {
  if (!isMetaPixelActive() || !runtimeConfig) return false;
  return runtimeConfig[category] === true;
}

export function sendFBEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (!isMetaPixelActive() || typeof window === 'undefined') return;
  if (params && Object.keys(params).length > 0) {
    window.fbq?.('track', eventName, params);
  } else {
    window.fbq?.('track', eventName);
  }
}

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

function whenFbqReady(fn: () => void, attempts = 50): void {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') {
    fn();
    return;
  }
  let left = attempts;
  const id = window.setInterval(() => {
    left -= 1;
    if (typeof window.fbq === 'function') {
      window.clearInterval(id);
      fn();
    } else if (left <= 0) {
      window.clearInterval(id);
    }
  }, 100);
}

export function sendFBEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (!isMetaPixelActive() || typeof window === 'undefined') return;
  whenFbqReady(() => {
    if (params && Object.keys(params).length > 0) {
      window.fbq?.('track', eventName, params);
    } else {
      window.fbq?.('track', eventName);
    }
  });
}

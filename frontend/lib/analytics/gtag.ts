import type { Ga4PublicConfig } from './types';

let runtimeConfig: Ga4PublicConfig | null = null;

export function setAnalyticsConfig(config: Ga4PublicConfig | null): void {
  runtimeConfig = config;
}

export function getAnalyticsConfig(): Ga4PublicConfig | null {
  return runtimeConfig;
}

export function isAnalyticsActive(): boolean {
  return Boolean(
    runtimeConfig?.isEnabled && runtimeConfig.measurementId,
  );
}

export function canTrack(
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
  if (!isAnalyticsActive() || !runtimeConfig) return false;
  return runtimeConfig[category] === true;
}

export function sendGAEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (!isAnalyticsActive() || typeof window === 'undefined') return;
  window.gtag?.('event', eventName, params);
}

export function runWhenIdle(fn: () => void, timeoutMs = 2000): void {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => fn(), { timeout: timeoutMs });
  } else {
    setTimeout(fn, 0);
  }
}

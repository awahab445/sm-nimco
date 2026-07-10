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

function whenGtagReady(fn: () => void, attempts = 50): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    fn();
    return;
  }
  let left = attempts;
  const id = window.setInterval(() => {
    left -= 1;
    if (typeof window.gtag === 'function') {
      window.clearInterval(id);
      fn();
    } else if (left <= 0) {
      window.clearInterval(id);
    }
  }, 100);
}

export function sendGAEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (!isAnalyticsActive() || typeof window === 'undefined') return;
  whenGtagReady(() => {
    window.gtag?.('event', eventName, params);
  });
}

export function runWhenIdle(fn: () => void, timeoutMs = 2000): void {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => fn(), { timeout: timeoutMs });
  } else {
    setTimeout(fn, 0);
  }
}

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

/** Manual Advanced Matching — plain values; Meta hashes in-browser. */
export type MetaPixelAdvancedMatching = {
  em?: string;
  ph?: string;
  external_id?: string;
  fb_login_id?: string;
};

function cleanAdvancedMatching(
  userData?: MetaPixelAdvancedMatching | null,
): Record<string, string> | null {
  if (!userData) return null;
  const cleaned: Record<string, string> = {};
  if (userData.em?.trim()) cleaned.em = userData.em.trim().toLowerCase();
  if (userData.ph?.trim()) {
    const digits = userData.ph.replace(/[^\d]/g, '');
    if (digits) cleaned.ph = digits;
  }
  if (userData.external_id?.trim()) {
    cleaned.external_id = userData.external_id.trim();
  }
  if (userData.fb_login_id?.trim()) {
    cleaned.fb_login_id = userData.fb_login_id.trim();
  }
  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

/**
 * Refresh Pixel Advanced Matching when known customer fields are available.
 * Re-init with the same pixel id is Meta's documented update path.
 */
export function setMetaAdvancedMatching(
  userData?: MetaPixelAdvancedMatching | null,
): void {
  if (!isMetaPixelActive() || !runtimeConfig?.metaPixelId) return;
  const cleaned = cleanAdvancedMatching(userData);
  if (!cleaned) return;
  const pixelId = runtimeConfig.metaPixelId;
  whenFbqReady(() => {
    window.fbq?.('init', pixelId, cleaned);
  });
}

export function sendFBEvent(
  eventName: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string; userData?: MetaPixelAdvancedMatching | null },
): void {
  if (!isMetaPixelActive() || typeof window === 'undefined') return;
  whenFbqReady(() => {
    const cleaned = cleanAdvancedMatching(options?.userData);
    if (cleaned && runtimeConfig?.metaPixelId) {
      window.fbq?.('init', runtimeConfig.metaPixelId, cleaned);
    }
    const eventID = options?.eventID?.trim();
    if (params && Object.keys(params).length > 0) {
      if (eventID) {
        window.fbq?.('track', eventName, params, { eventID });
      } else {
        window.fbq?.('track', eventName, params);
      }
    } else if (eventID) {
      window.fbq?.('track', eventName, {}, { eventID });
    } else {
      window.fbq?.('track', eventName);
    }
  });
}

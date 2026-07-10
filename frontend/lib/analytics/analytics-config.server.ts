import { SERVER_API_BASE_URL } from '@/lib/api-base-url';
import { CACHE_TAGS } from '@/lib/cache-tags';
import type { Ga4PublicConfig } from '@/lib/analytics/types';

const DISABLED: Ga4PublicConfig = {
  isEnabled: false,
  measurementId: null,
  gtmId: null,
  metaPixelId: null,
  metaPixelEnabled: false,
  debugMode: false,
  trackPageViews: true,
  trackCartEvents: true,
  trackCheckoutSteps: true,
  trackPurchases: true,
  trackRefunds: false,
  trackCustomEvents: true,
  anonymizeIp: true,
  currency: 'PKR',
};

export async function fetchAnalyticsConfig(): Promise<Ga4PublicConfig> {
  try {
    const res = await fetch(`${SERVER_API_BASE_URL}/storefront/analytics-config`, {
      next: { revalidate: 60, tags: [CACHE_TAGS.analytics, CACHE_TAGS.storefront] },
    });
    if (!res.ok) return DISABLED;
    const json = (await res.json()) as { data?: Ga4PublicConfig };
    return json.data ?? DISABLED;
  } catch {
    return DISABLED;
  }
}

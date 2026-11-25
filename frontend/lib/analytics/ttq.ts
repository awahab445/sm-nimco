import type { Ga4Item, Ga4PublicConfig } from './types';
import type { MetaPixelAdvancedMatching } from './fbq';
import { isCatalogUuid, sumItemValue } from './mappers';

let runtimeConfig: Ga4PublicConfig | null = null;

export function setTikTokPixelConfig(config: Ga4PublicConfig | null): void {
  runtimeConfig = config;
}

export function isTikTokPixelActive(): boolean {
  return Boolean(
    runtimeConfig?.tiktokPixelEnabled && runtimeConfig.tiktokPixelId,
  );
}

export function canTrackTikTok(
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
  if (!isTikTokPixelActive() || !runtimeConfig) return false;
  return runtimeConfig[category] === true;
}

function whenTtqReady(fn: () => void, attempts = 50): void {
  if (typeof window === 'undefined') return;
  if (typeof window.ttq?.track === 'function') {
    fn();
    return;
  }
  let left = attempts;
  const id = window.setInterval(() => {
    left -= 1;
    if (typeof window.ttq?.track === 'function') {
      window.clearInterval(id);
      fn();
    } else if (left <= 0) {
      window.clearInterval(id);
    }
  }, 100);
}

/**
 * Normalized (not yet hashed) TikTok `ttq.identify` fields from the same
 * match data used for Meta. Hash with `hashTikTokIdentify` before sending.
 */
export function toTikTokIdentify(
  userData?: MetaPixelAdvancedMatching | null,
): Record<string, string> | null {
  if (!userData) return null;
  const out: Record<string, string> = {};
  const email = userData.em?.trim().toLowerCase();
  let digits = userData.ph?.replace(/[^\d]/g, '') ?? '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  // Local PK mobile 03XXXXXXXXX → 92…, same rule as backend normalizePakistanWhatsAppNumber.
  if (digits.startsWith('0') && digits.length === 11) digits = `92${digits.slice(1)}`;
  const externalId = userData.external_id?.trim();
  if (email) out.email = email;
  if (digits) out.phone_number = `+${digits}`;
  if (externalId) out.external_id = externalId;
  return Object.keys(out).length > 0 ? out : null;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}

/**
 * SHA-256 every identify field client-side, as TikTok requires (plain values
 * trigger "invalid email" diagnostics). Null when nothing to send or
 * SubtleCrypto is unavailable (non-HTTPS) — never falls back to plain text.
 */
export async function hashTikTokIdentify(
  userData?: MetaPixelAdvancedMatching | null,
): Promise<Record<string, string> | null> {
  const identify = toTikTokIdentify(userData);
  if (!identify || typeof crypto === 'undefined' || !crypto.subtle) return null;
  try {
    const entries = await Promise.all(
      Object.entries(identify).map(
        async ([key, value]) => [key, await sha256Hex(value)] as const,
      ),
    );
    return Object.fromEntries(entries);
  } catch {
    return null;
  }
}

export function setTikTokIdentify(
  userData?: MetaPixelAdvancedMatching | null,
): void {
  if (!isTikTokPixelActive()) return;
  void hashTikTokIdentify(userData).then((identify) => {
    if (identify) whenTtqReady(() => window.ttq?.identify(identify));
  });
}

/** TikTok ecommerce payload (catalog `content_id` = SKU, never a UUID). */
export function ttContentFromItems(
  items: Ga4Item[],
  currency: string,
): {
  contents: Array<{
    content_id: string;
    content_type: 'product';
    content_name: string;
    quantity: number;
    price: number;
  }>;
  content_type: 'product';
  value: number;
  currency: string;
} {
  const withSku = items.filter(
    (i) => i.item_id?.trim() && !isCatalogUuid(i.item_id),
  );
  return {
    contents: withSku.map((i) => ({
      content_id: i.item_id,
      content_type: 'product',
      content_name: i.item_name,
      quantity: i.quantity,
      price: i.price,
    })),
    content_type: 'product',
    value: sumItemValue(withSku.length ? withSku : items),
    currency,
  };
}

export function sendTikTokEvent(
  eventName: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string; userData?: MetaPixelAdvancedMatching | null },
): void {
  if (!isTikTokPixelActive() || typeof window === 'undefined') return;
  const eventID = options?.eventID?.trim();
  // Identify must land before track, so hash first, then send both.
  void hashTikTokIdentify(options?.userData).then((identify) => {
    whenTtqReady(() => {
      if (identify) window.ttq?.identify(identify);
      // Same event_id as the server Events API send, so TikTok dedupes them.
      window.ttq?.track(eventName, params ?? {}, eventID ? { event_id: eventID } : undefined);
    });
  });
}

export function sendTikTokPageView(): void {
  if (!isTikTokPixelActive() || typeof window === 'undefined') return;
  whenTtqReady(() => window.ttq?.page());
}

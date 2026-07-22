import { stripPiiFromUrlString } from './sanitize-meta-url';

/** Read Meta Pixel cookies for Conversions API matching. */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return match.slice(name.length + 1);
  }
}

export function getMetaFbp(): string | null {
  return readCookie('_fbp');
}

export function getMetaFbc(): string | null {
  return readCookie('_fbc');
}

/** Optional known customer fields for Meta match quality (never invent). */
export type MetaMatchUser = {
  id?: string | null;
  email?: string | null;
  phone?: string | null;
  /** Only if the app already stores a Facebook Login ID. */
  fbLoginId?: string | null;
};

export type MetaCapiClientFields = {
  eventId?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
  externalId?: string;
  email?: string;
  phone?: string;
  fbLoginId?: string;
};

/** Pixel Advanced Matching params (plain; Meta hashes client-side). */
export type MetaPixelUserData = {
  em?: string;
  ph?: string;
  external_id?: string;
  fb_login_id?: string;
};

export function metaMatchUserToPixelData(
  user?: MetaMatchUser | null,
): MetaPixelUserData | undefined {
  if (!user) return undefined;
  const data: MetaPixelUserData = {};
  const email = user.email?.trim().toLowerCase();
  const phone = user.phone?.replace(/[^\d]/g, '');
  const externalId = user.id?.trim();
  const fbLoginId = user.fbLoginId?.trim();
  if (email) data.em = email;
  if (phone) data.ph = phone;
  if (externalId) data.external_id = externalId;
  if (fbLoginId) data.fb_login_id = fbLoginId;
  return Object.keys(data).length > 0 ? data : undefined;
}

/** Fields to attach on cart/checkout API bodies for server-side CAPI. */
export function metaCapiClientFields(
  eventId?: string,
  user?: MetaMatchUser | null,
): MetaCapiClientFields {
  const fbp = getMetaFbp();
  const fbc = getMetaFbc();
  const rawUrl =
    typeof window !== 'undefined' ? window.location.href : undefined;
  const eventSourceUrl = stripPiiFromUrlString(rawUrl);
  const externalId = user?.id?.trim();
  const email = user?.email?.trim();
  const phone = user?.phone?.trim();
  const fbLoginId = user?.fbLoginId?.trim();
  return {
    ...(eventId ? { eventId } : {}),
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
    ...(eventSourceUrl ? { eventSourceUrl } : {}),
    ...(externalId ? { externalId } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(fbLoginId ? { fbLoginId } : {}),
  };
}

export function addToCartEventId(
  cartId: string,
  variantId: string,
): string {
  return `atc_${cartId}_${variantId}_${Date.now()}`;
}

export function beginCheckoutEventId(checkoutId: string): string {
  return `begin_checkout_${checkoutId}`;
}

export function purchaseEventId(orderNumber: string): string {
  return `purchase_${orderNumber}`;
}

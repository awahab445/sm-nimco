import { getApiBaseUrl } from '../api-base-url';
import { stripPiiFromUrlString } from './sanitize-meta-url';
import { getGuestMatchPhone, getGuestOrderEmail } from '../guest-order-session';

/** Read Meta Pixel cookies for Conversions API matching. */

const FBC_COOKIE = '_fbc';
const FBP_COOKIE = '_fbp';
/** 90 days — Meta's recommended retention for click IDs. */
const FBC_MAX_AGE_SECONDS = 7_776_000;
const FBCLID_STORAGE_KEY = 'meta_fbclid';
const FBC_STORAGE_KEY = 'meta_fbc';

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

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode / quota
  }
}

/** Meta `_fbc` format: fb.{subdomainIndex}.{creation_time_ms}.{fbclid} */
function isValidFbc(value: string | null | undefined): value is string {
  if (!value?.trim()) return false;
  return /^fb\.\d+\.\d+\..+/.test(value.trim());
}

function buildFbc(fbclid: string, timestampMs = Date.now()): string {
  return `fb.1.${timestampMs}.${fbclid.trim()}`;
}

function fbclidFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = new URL(window.location.href).searchParams.get('fbclid');
    return id?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Persist click id as `_fbc` (Meta format) when `fbclid` is present.
 * Does not overwrite an existing valid `_fbc` cookie.
 * Also mirrors to localStorage so later ATC/IC can recover if the cookie is missing.
 */
export function ensureMetaFbcFromUrl(fbclidOverride?: string | null): string | null {
  if (typeof document === 'undefined') return null;

  const existing = readCookie(FBC_COOKIE);
  if (isValidFbc(existing)) {
    writeStorage(FBC_STORAGE_KEY, existing.trim());
    const parts = existing.trim().split('.');
    const storedClid = parts.slice(3).join('.');
    if (storedClid) writeStorage(FBCLID_STORAGE_KEY, storedClid);
    return existing.trim();
  }

  const fbclid = (fbclidOverride ?? fbclidFromUrl() ?? readStorage(FBCLID_STORAGE_KEY))?.trim();
  if (!fbclid) {
    const storedFbc = readStorage(FBC_STORAGE_KEY);
    if (isValidFbc(storedFbc)) {
      writeCookie(FBC_COOKIE, storedFbc.trim(), FBC_MAX_AGE_SECONDS);
      return storedFbc.trim();
    }
    return null;
  }

  writeStorage(FBCLID_STORAGE_KEY, fbclid);
  const value = buildFbc(fbclid);
  writeCookie(FBC_COOKIE, value, FBC_MAX_AGE_SECONDS);
  writeStorage(FBC_STORAGE_KEY, value);
  return value;
}

const TTCLID_COOKIE = 'ttclid';
const TTP_COOKIE = '_ttp';
/** TikTok click attribution window is up to 28 days. */
const TTCLID_MAX_AGE_SECONDS = 2_592_000;

/** Persist TikTok `ttclid` from the landing URL (first-party cookie for Events API). */
export function ensureTikTokClickIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = new URL(window.location.href).searchParams.get('ttclid')?.trim();
    if (id) {
      writeCookie(TTCLID_COOKIE, id, TTCLID_MAX_AGE_SECONDS);
      return id;
    }
  } catch {
    // ignore malformed URLs
  }
  return readCookie(TTCLID_COOKIE);
}

export function getMetaFbp(): string | null {
  return readCookie(FBP_COOKIE);
}

/**
 * Always prefer the live `_fbc` cookie; if missing, reconstruct from URL/localStorage.
 * Callers should prefer this (or `ensureMetaFbcFromUrl`) before every Pixel/CAPI send.
 */
export function getMetaFbc(): string | null {
  if (typeof document === 'undefined') return null;
  const fromCookie = readCookie(FBC_COOKIE);
  if (isValidFbc(fromCookie)) return fromCookie.trim();
  return ensureMetaFbcFromUrl();
}

/** Optional known customer fields for Meta match quality (never invent). */
export type MetaMatchUser = {
  id?: string | null;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  /** Only if the app already stores a Facebook Login ID. */
  fbLoginId?: string | null;
};

/**
 * Build match params for ATC / Pixel: auth profile when logged in;
 * otherwise guest email/phone from prior checkout / order lookup when known.
 */
export function resolveMetaMatchUser(
  authUser?: {
    id?: string | null;
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    fbLoginId?: string | null;
  } | null,
): MetaMatchUser | null {
  if (
    authUser?.id ||
    authUser?.email ||
    authUser?.phone ||
    authUser?.firstName ||
    authUser?.lastName ||
    authUser?.fbLoginId
  ) {
    return {
      id: authUser.id,
      email: authUser.email,
      phone: authUser.phone,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      fbLoginId: authUser.fbLoginId,
    };
  }
  const guestEmail = getGuestOrderEmail();
  const guestPhone = getGuestMatchPhone();
  if (guestEmail || guestPhone) {
    return { email: guestEmail, phone: guestPhone };
  }
  return null;
}

export type MetaCapiClientFields = {
  eventId?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
  externalId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fbLoginId?: string;
  ttp?: string;
  ttclid?: string;
};

/** Pixel Advanced Matching params (plain; Meta hashes client-side). */
export type MetaPixelUserData = {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
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
  const firstName = user.firstName?.trim().toLowerCase();
  const lastName = user.lastName?.trim().toLowerCase();
  const externalId = user.id?.trim();
  const fbLoginId = user.fbLoginId?.trim();
  if (email) data.em = email;
  if (phone) data.ph = phone;
  if (firstName) data.fn = firstName;
  if (lastName) data.ln = lastName;
  if (externalId) data.external_id = externalId;
  if (fbLoginId) data.fb_login_id = fbLoginId;
  return Object.keys(data).length > 0 ? data : undefined;
}

/** Fields to attach on cart/checkout API bodies for server-side CAPI. */
export function metaCapiClientFields(
  eventId?: string,
  user?: MetaMatchUser | null,
): MetaCapiClientFields {
  // Capture fbclid → _fbc synchronously so ATC before React effect still gets fbc.
  const fbc = ensureMetaFbcFromUrl();
  const fbp = getMetaFbp();
  const ttclid = ensureTikTokClickIdFromUrl();
  const ttp = readCookie(TTP_COOKIE);
  const rawUrl =
    typeof window !== 'undefined' ? window.location.href : undefined;
  const eventSourceUrl = stripPiiFromUrlString(rawUrl);
  const externalId = user?.id?.trim();
  const email = user?.email?.trim();
  const phone = user?.phone?.trim();
  const firstName = user?.firstName?.trim();
  const lastName = user?.lastName?.trim();
  const fbLoginId = user?.fbLoginId?.trim();
  return {
    ...(eventId ? { eventId } : {}),
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
    ...(eventSourceUrl ? { eventSourceUrl } : {}),
    ...(externalId ? { externalId } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(fbLoginId ? { fbLoginId } : {}),
    ...(ttp ? { ttp } : {}),
    ...(ttclid ? { ttclid } : {}),
  };
}

/** Fire-and-forget CAPI PageView so EMQ can use hashed email/phone + IP/UA. */
export function enqueueMetaCapiPageView(
  eventId: string,
  user?: MetaMatchUser | null,
): void {
  if (typeof window === 'undefined' || !eventId.trim()) return;
  const url = `${getApiBaseUrl()}/storefront/analytics/pageview`;
  void fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metaCapiClientFields(eventId, user)),
    keepalive: true,
  }).catch(() => {
    // Never block navigation or surface CAPI failures in the UI.
  });
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

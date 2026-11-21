import { fetchApi, type StorefrontSiteConfig, type StorefrontStoreSettings } from '@/lib/api-client';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { STORE_NAME } from '@/lib/config';
import { getDefaultWhatsappPhone, normalizeWhatsappNumber } from '@/lib/whatsapp-order';

/** Per-store facts shown on the contact and policy pages (Google Merchant Center checks these). */
export type StoreFacts = {
  storeName: string;
  /** Digits-only with country code, e.g. 923001234567. */
  phone: string;
  /** Optional, from NEXT_PUBLIC_STORE_EMAIL. */
  email: string | null;
  freeDeliveryThreshold: number | null;
  /** Active checkout payment method names, e.g. ["Cash on Delivery"]. */
  paymentMethods: string[];
};

const next = { revalidate: 300, tags: [CACHE_TAGS.storefront] };

async function safe<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

/** Server-side only. Each source falls back independently so a failing API never breaks the page. */
export async function getStoreFacts(): Promise<StoreFacts> {
  const [site, settings, methods] = await Promise.all([
    safe(fetchApi<{ data: StorefrontSiteConfig }>('/settings/site-config', { next })),
    safe(fetchApi<{ data: StorefrontStoreSettings }>('/settings/store', { next })),
    safe(fetchApi<Array<{ name: string }>>('/payments/methods', { next })),
  ]);
  const threshold = Number(settings?.data?.freeDeliveryThreshold);
  return {
    storeName: STORE_NAME,
    phone: normalizeWhatsappNumber(site?.data?.whatsappNumber) ?? getDefaultWhatsappPhone(),
    email: process.env.NEXT_PUBLIC_STORE_EMAIL?.trim() || null,
    freeDeliveryThreshold: Number.isFinite(threshold) && threshold > 0 ? threshold : null,
    paymentMethods: Array.isArray(methods) ? methods.map((m) => m.name?.trim()).filter((n): n is string => Boolean(n)) : [],
  };
}

/** 923001234567 → "+92 300 1234567"; other numbers get a leading +. */
export function formatPhone(digits: string): string {
  if (digits.startsWith('92') && digits.length === 12) return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `+${digits}`;
}

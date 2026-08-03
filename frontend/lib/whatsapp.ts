'use client';

import { siteConfigApi } from '@/lib/api-client';
import { useEffect, useState } from 'react';

/**
 * Build a wa.me chat URL. Accepts full https://wa.me/... links or digit phone numbers.
 * Returns null when the value cannot be resolved.
 */
export function normalizeWhatsAppUrl(
  raw: string | null | undefined,
  prefillMessage?: string,
): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  let href = trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 8) return null;
    href = `https://wa.me/${digits}`;
  }

  if (!prefillMessage?.trim()) return href;

  try {
    const url = new URL(href);
    if (!url.searchParams.has('text')) {
      url.searchParams.set('text', prefillMessage.trim());
    }
    return url.toString();
  } catch {
    return href;
  }
}

/**
 * Resolves the store WhatsApp chat URL from admin social links (platform=whatsapp),
 * falling back to NEXT_PUBLIC_STORE_SOCIAL_WHATSAPP. null when not configured.
 */
export function useStoreWhatsAppUrl(prefillMessage?: string): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      let resolved: string | null = null;
      try {
        const res = await siteConfigApi.getSocialLinks();
        const link = (res.data ?? []).find(
          (item) => item.platform === 'whatsapp' && item.url?.trim(),
        );
        resolved = normalizeWhatsAppUrl(link?.url, prefillMessage);
      } catch {
        /* use env fallback below */
      }

      if (!resolved) {
        resolved = normalizeWhatsAppUrl(
          process.env.NEXT_PUBLIC_STORE_SOCIAL_WHATSAPP,
          prefillMessage,
        );
      }

      if (!cancelled) setUrl(resolved);
    })();

    return () => {
      cancelled = true;
    };
  }, [prefillMessage]);

  return url;
}

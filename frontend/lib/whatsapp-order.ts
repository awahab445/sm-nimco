import { formatPrice } from '@/lib/currency';

/** Official store WhatsApp number (digits only, no +) for wa.me links. */
export const DEFAULT_WHATSAPP_PHONE = '923442394143';

/** Display format for support/contact chrome. */
export const DEFAULT_WHATSAPP_DISPLAY = '+92 344 2394143';

/** Digits-only E.164 without leading + (e.g. 923442394143) for wa.me links. */
export function normalizeWhatsappNumber(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}

const ENV_WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.trim() ||
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
  DEFAULT_WHATSAPP_PHONE;

/** Store WhatsApp number from env with a safe fallback. */
export function getDefaultWhatsappPhone(): string {
  return normalizeWhatsappNumber(ENV_WHATSAPP_PHONE) ?? DEFAULT_WHATSAPP_PHONE;
}

export function buildProductOrderWhatsappUrl(params: {
  phone: string;
  productName: string;
  price: string | number;
  quantity?: number;
}): string {
  const phone = normalizeWhatsappNumber(params.phone);
  if (!phone) return 'https://wa.me/';

  const quantity = params.quantity ?? 1;
  const priceLabel =
    typeof params.price === 'number' || typeof params.price === 'string'
      ? formatPrice(params.price)
      : String(params.price);

  const message = `Hi, I would like to order:\n- Product: ${params.productName}\n- Quantity: ${quantity}\n- Price: ${priceLabel}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

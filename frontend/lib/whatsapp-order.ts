import { formatPrice } from '@/lib/currency';

/** Digits-only E.164 without leading + (e.g. 923001234567) for wa.me links. */
export function normalizeWhatsappNumber(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}

const ENV_WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.trim() ||
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
  '923711317164';

/** Store WhatsApp number from env with a safe fallback. */
export function getDefaultWhatsappPhone(): string {
  return normalizeWhatsappNumber(ENV_WHATSAPP_PHONE) ?? '923711317164';
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

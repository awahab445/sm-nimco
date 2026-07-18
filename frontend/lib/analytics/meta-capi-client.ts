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

export type MetaCapiClientFields = {
  eventId?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
};

/** Fields to attach on cart/checkout API bodies for server-side CAPI. */
export function metaCapiClientFields(
  eventId?: string,
): MetaCapiClientFields {
  const fbp = getMetaFbp();
  const fbc = getMetaFbc();
  const eventSourceUrl =
    typeof window !== 'undefined' ? window.location.href : undefined;
  return {
    ...(eventId ? { eventId } : {}),
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
    ...(eventSourceUrl ? { eventSourceUrl } : {}),
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

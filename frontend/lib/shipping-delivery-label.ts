/** Human-readable delivery windows for nationwide shipping methods. */
export function shippingDeliveryLabel(methodCode: string): string | null {
  if (methodCode === 'economy_shipping') return '2 to 4 Days';
  if (methodCode === 'overland_shipping') return '4 to 6 Days';
  return null;
}

export function shippingMethodDisplayName(methodCode: string, fallbackName: string): string {
  if (methodCode === 'economy_shipping') return 'Economy Shipping';
  if (methodCode === 'overland_shipping') return 'Overland Shipping';
  return fallbackName;
}

export function shippingMethodEmoji(methodCode: string): string {
  if (methodCode === 'economy_shipping') return '🚚';
  if (methodCode === 'overland_shipping') return '🚛';
  return '';
}

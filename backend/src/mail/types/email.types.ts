export type OrderEmailLineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderEmailDetails = {
  orderNumber: string;
  orderId: string;
  customerName?: string | null;
  currency: string;
  items: OrderEmailLineItem[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  placedAt: Date;
  trackOrderUrl?: string;
};

export type OrderCancellationEmailDetails = OrderEmailDetails & {
  cancelledAt: Date;
  reason?: string;
  refundStatus: 'refund_pending' | 'not_charged' | 'no_refund_required';
  refundMessage: string;
};

export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
};

/** Useful storefront links shown in the shared email footer. */
export type BrandFooterLinks = {
  shop: string;
  trackOrder: string;
  privacy?: string;
  terms?: string;
  support?: string;
};

export type BrandConfig = {
  storeName: string;
  /** Absolute HTTPS (or http in dev) URL — required for email clients. */
  logoUrl?: string;
  /** Charcoal / navy text accents (Essa foreground). */
  primaryColor: string;
  /** Orange CTA accent (`#ff4800`). */
  ctaColor: string;
  accentColor: string;
  textColor: string;
  mutedTextColor: string;
  footerTextColor: string;
  backgroundColor: string;
  borderColor: string;
  social: SocialLinks;
  links: BrandFooterLinks;
};

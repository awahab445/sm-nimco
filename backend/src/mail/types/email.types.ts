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

export type BrandConfig = {
  storeName: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  social: SocialLinks;
};

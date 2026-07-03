export type Ga4PublicConfig = {
  isEnabled: boolean;
  measurementId: string | null;
  gtmId: string | null;
  debugMode: boolean;
  trackPageViews: boolean;
  trackCartEvents: boolean;
  trackCheckoutSteps: boolean;
  trackPurchases: boolean;
  trackRefunds: boolean;
  trackCustomEvents: boolean;
  anonymizeIp: boolean;
  currency: string;
};

export type Ga4Item = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
};

export type Ga4EventCategory =
  | 'page'
  | 'cart'
  | 'checkout'
  | 'purchase'
  | 'refund'
  | 'custom';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

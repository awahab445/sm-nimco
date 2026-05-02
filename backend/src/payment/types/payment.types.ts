/**
 * Payment flow types
 */
export enum PaymentFlowType {
  CLIENT_SECRET = 'CLIENT_SECRET',
  REDIRECT = 'REDIRECT',
  HOSTED_PAGE = 'HOSTED_PAGE',
  OFFLINE = 'OFFLINE',
}

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CAPTURED = 'captured',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Payment provider codes
 */
export enum PaymentProviderCode {
  STRIPE = 'stripe',
  EASYPAISA = 'easypaisa',
  JAZZCASH = 'jazzcash',
  UBL = 'ubl',
  HBL = 'hbl',
  COD = 'cod',
}

/**
 * Payment intent creation result
 */
export interface PaymentIntentResult {
  paymentId: string;
  gatewayTransactionId: string;
  flowType: PaymentFlowType;
  clientSecret?: string;
  redirectUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Callback verification result
 */
export interface CallbackVerificationResult {
  isValid: boolean;
  paymentId: string;
  gatewayTransactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gatewayResponse: Record<string, any>;
  error?: string;
}

/**
 * Payment method configuration (from DB)
 */
export interface PaymentMethodConfig {
  id: string;
  code: string;
  provider: string;
  flowType: PaymentFlowType;
  config: Record<string, any>;
}

/**
 * Create intent parameters
 */
export interface CreateIntentParams {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
  cancelUrl?: string;
}


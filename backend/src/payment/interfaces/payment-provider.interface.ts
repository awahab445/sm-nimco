import {
  PaymentFlowType,
  PaymentIntentResult,
  CallbackVerificationResult,
  CreateIntentParams,
  PaymentMethodConfig,
} from '../types/payment.types';

/**
 * Unified PaymentProvider interface
 * All payment gateways must implement this interface
 */
export interface PaymentProvider {
  /**
   * Get the provider code (e.g., 'stripe', 'easypaisa')
   */
  getProviderCode(): string;

  /**
   * Get the flow type this provider supports
   */
  getFlowType(): PaymentFlowType;

  /**
   * Create a payment intent
   * Returns either clientSecret (for CLIENT_SECRET) or redirectUrl (for REDIRECT/HOSTED_PAGE)
   */
  createIntent(
    params: CreateIntentParams,
    config: PaymentMethodConfig,
  ): Promise<PaymentIntentResult>;

  /**
   * Verify callback from gateway
   * Validates signature/checksum and returns verification result
   */
  verifyCallback(
    callbackData: Record<string, any>,
    config: PaymentMethodConfig,
    context?: { rawBody?: Buffer; signature?: string },
  ): Promise<CallbackVerificationResult>;

  /**
   * Capture a payment (optional, for gateways that support it)
   */
  capture?(paymentId: string, config: PaymentMethodConfig): Promise<boolean>;

  /**
   * Refund a payment (optional, for gateways that support it)
   */
  refund?(
    paymentId: string,
    amount: number,
    config: PaymentMethodConfig,
  ): Promise<boolean>;
}

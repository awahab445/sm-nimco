import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import {
  PaymentFlowType,
  PaymentIntentResult,
  CallbackVerificationResult,
  CreateIntentParams,
  PaymentMethodConfig,
  PaymentProviderCode,
  PaymentStatus,
} from '../types/payment.types';
import { randomUUID } from 'crypto';

/**
 * Cash on Delivery (COD) Payment Provider
 *
 * Offline payment method where payment is collected after delivery.
 * No external gateway, no redirects, no client secrets.
 */
@Injectable()
export class OfflineCODProvider implements PaymentProvider {
  private readonly logger = new Logger(OfflineCODProvider.name);

  getProviderCode(): string {
    return PaymentProviderCode.COD;
  }

  getFlowType(): PaymentFlowType {
    return PaymentFlowType.OFFLINE;
  }

  /**
   * Create COD payment intent
   *
   * For COD, we simply return the payment details.
   * The actual payment record is created by PaymentService.
   * No external API calls are made.
   */
  async createIntent(
    params: CreateIntentParams,
    config: PaymentMethodConfig,
  ): Promise<PaymentIntentResult> {
    this.logger.log(
      `Creating COD payment intent for order ${params.orderId}, amount: ${params.amount} ${params.currency}`,
    );

    // Generate a unique transaction ID for tracking (not a gateway transaction)
    const transactionId = `COD-${randomUUID()}`;

    return {
      paymentId: params.orderId, // Will be replaced by PaymentService with actual payment ID
      gatewayTransactionId: transactionId,
      flowType: PaymentFlowType.OFFLINE,
      // No clientSecret or redirectUrl for COD
      metadata: {
        transactionId,
        paymentMethod: 'cod',
        orderId: params.orderId,
        orderNumber: params.metadata?.orderNumber,
      },
    };
  }

  /**
   * Verify callback from gateway
   *
   * Not applicable for COD (no gateway callbacks).
   * Returns invalid result as COD doesn't use callbacks.
   */
  async verifyCallback(
    callbackData: Record<string, any>,
    config: PaymentMethodConfig,
  ): Promise<CallbackVerificationResult> {
    this.logger.warn(
      'verifyCallback called on COD provider - COD does not support gateway callbacks',
    );

    return {
      isValid: false,
      paymentId: '',
      gatewayTransactionId: '',
      amount: 0,
      currency: '',
      status: PaymentStatus.FAILED,
      gatewayResponse: callbackData,
      error: 'COD does not support gateway callbacks',
    };
  }

  /**
   * Capture COD payment
   *
   * For COD, capture means marking the payment as collected.
   * This is typically called after successful delivery.
   *
   * Note: The actual database update is handled by PaymentService.
   * This method exists to satisfy the interface but COD capture
   * is handled through PaymentService.markCODAsCollected().
   */
  async capture(
    paymentId: string,
    config: PaymentMethodConfig,
  ): Promise<boolean> {
    this.logger.log(`Capture requested for COD payment ${paymentId}`);

    // For COD, capture is handled by PaymentService.markCODAsCollected()
    // This method is here for interface compliance
    // In practice, COD capture should be done via the service method
    return true;
  }

  /**
   * Refund COD payment
   *
   * COD payments can only be refunded if they were captured.
   * This is typically used for RTO (Return to Origin) scenarios.
   */
  async refund(
    paymentId: string,
    amount: number,
    config: PaymentMethodConfig,
  ): Promise<boolean> {
    this.logger.log(
      `Refund requested for COD payment ${paymentId}, amount: ${amount}`,
    );

    // For COD, refunds are handled by PaymentService.markCODAsFailed()
    // This method is here for interface compliance
    // In practice, COD refunds should be done via the service method
    return true;
  }
}

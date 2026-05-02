import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentProvider } from '../../interfaces/payment-provider.interface';
import {
  PaymentFlowType,
  PaymentIntentResult,
  CallbackVerificationResult,
  CreateIntentParams,
  PaymentMethodConfig,
  PaymentStatus,
} from '../../types/payment.types';

/**
 * Base configuration interface for bank-hosted payment providers
 */
export interface BankHostedConfig {
  merchantId: string;
  terminalId: string;
  secretKey: string;
  paymentUrl: string;
  callbackUrl?: string;
}

/**
 * Base class for bank-hosted page payment providers (UBL, HBL, etc.)
 * 
 * Provides common functionality for:
 * - Generating redirect payloads
 * - Signing requests using secretKey
 * - Building hosted payment URLs
 * - Verifying callback signatures
 * - Normalizing bank response format
 * 
 * Subclasses should override:
 * - getProviderCode(): string
 * - generateSignature(): string (if signature algorithm differs)
 * - buildRedirectPayload(): Record<string, any> (if parameter mapping differs)
 * - extractCallbackFields(): CallbackFields (if callback field names differ)
 * - mapBankStatus(): PaymentStatus (if status mapping differs)
 */
@Injectable()
export abstract class BankHostedBaseProvider implements PaymentProvider {
  protected readonly logger: Logger;

  constructor(providerName: string) {
    this.logger = new Logger(providerName);
  }

  /**
   * Get the provider code (must be implemented by subclasses)
   */
  abstract getProviderCode(): string;

  /**
   * Get the flow type - always HOSTED_PAGE for bank-hosted providers
   */
  getFlowType(): PaymentFlowType {
    return PaymentFlowType.HOSTED_PAGE;
  }

  /**
   * Generate signature/hash for payment request
   * Default implementation uses HMAC-SHA256
   * Override in subclasses if different algorithm is required
   */
  protected generateSignature(
    payload: Record<string, string>,
    secretKey: string,
  ): string {
    // Build signature string from sorted keys
    const sortedKeys = Object.keys(payload).sort();
    const signatureString = sortedKeys
      .map((key) => `${key}=${payload[key]}`)
      .join('&');

    // Generate HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signatureString);
    return hmac.digest('hex').toUpperCase();
  }

  /**
   * Generate signature for callback verification
   * Default implementation uses HMAC-SHA256
   * Override in subclasses if different algorithm is required
   */
  protected generateCallbackSignature(
    callbackData: Record<string, any>,
    secretKey: string,
    excludeFields: string[] = ['signature', 'hash', 'checksum'],
  ): string {
    // Build signature string from sorted keys, excluding signature fields
    const sortedKeys = Object.keys(callbackData)
      .filter((key) => !excludeFields.includes(key.toLowerCase()))
      .sort();

    const signatureString = sortedKeys
      .map((key) => `${key}=${callbackData[key]}`)
      .join('&');

    // Generate HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signatureString);
    return hmac.digest('hex').toUpperCase();
  }

  /**
   * Build redirect payload for payment request
   * Override in subclasses if parameter mapping differs
   */
  protected buildRedirectPayload(
    params: CreateIntentParams,
    config: BankHostedConfig,
    gatewayTransactionId: string,
  ): Record<string, string> {
    const amount = params.amount.toFixed(2);

    return {
      merchantId: config.merchantId,
      terminalId: config.terminalId,
      orderId: params.orderId,
      transactionId: gatewayTransactionId,
      amount: amount,
      currency: params.currency || 'PKR',
      customerEmail: params.customerEmail,
      customerName: params.customerName || '',
      successUrl: params.returnUrl || '',
      failureUrl: params.cancelUrl || '',
    };
  }

  /**
   * Extract callback fields from bank response
   * Override in subclasses if field names differ
   */
  protected extractCallbackFields(callbackData: Record<string, any>): {
    transactionId: string;
    orderId: string;
    amount: string;
    status: string;
    signature: string;
    currency: string;
    message?: string;
  } {
    return {
      transactionId:
        callbackData.transactionId ||
        callbackData.transactionRef ||
        callbackData.txnRef ||
        callbackData.referenceNumber ||
        '',
      orderId:
        callbackData.orderId ||
        callbackData.orderRef ||
        callbackData.billReference ||
        '',
      amount:
        callbackData.amount ||
        callbackData.orderAmount ||
        callbackData.txnAmount ||
        '0',
      status:
        callbackData.status ||
        callbackData.responseCode ||
        callbackData.paymentStatus ||
        callbackData.resultCode ||
        '',
      signature:
        callbackData.signature ||
        callbackData.hash ||
        callbackData.checksum ||
        callbackData.authCode ||
        '',
      currency: callbackData.currency || 'PKR',
      message:
        callbackData.message ||
        callbackData.responseMessage ||
        callbackData.description ||
        undefined,
    };
  }

  /**
   * Map bank status to PaymentStatus enum
   * Override in subclasses if status values differ
   */
  protected mapBankStatus(bankStatus: string): PaymentStatus {
    const statusUpper = String(bankStatus).toUpperCase().trim();

    // Success indicators
    if (
      statusUpper === 'SUCCESS' ||
      statusUpper === '00' ||
      statusUpper === '000' ||
      statusUpper === 'COMPLETED' ||
      statusUpper === 'APPROVED' ||
      statusUpper === 'AUTHORIZED'
    ) {
      return PaymentStatus.CAPTURED;
    }

    // Pending/Processing indicators
    if (
      statusUpper === 'PENDING' ||
      statusUpper === 'PROCESSING' ||
      statusUpper === 'IN_PROGRESS'
    ) {
      return PaymentStatus.PROCESSING;
    }

    // Failure indicators
    return PaymentStatus.FAILED;
  }

  /**
   * Generate unique gateway transaction ID
   */
  protected generateGatewayTransactionId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Create payment intent and generate redirect URL
   */
  async createIntent(
    params: CreateIntentParams,
    config: PaymentMethodConfig,
  ): Promise<PaymentIntentResult> {
    const bankConfig = this.validateConfig(config.config as BankHostedConfig);

    // Generate unique transaction reference
    const gatewayTransactionId = this.generateGatewayTransactionId(
      this.getProviderCode().toUpperCase().substring(0, 2),
    );

    // Build redirect payload
    const payload = this.buildRedirectPayload(params, bankConfig, gatewayTransactionId);

    // Generate signature
    const signature = this.generateSignature(payload, bankConfig.secretKey);
    payload.signature = signature;

    // Build redirect URL
    const redirectUrl = new URL(bankConfig.paymentUrl);
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        redirectUrl.searchParams.append(key, String(value));
      }
    });

    this.logger.log(
      `Bank payment intent created: ${gatewayTransactionId} for order ${params.orderId}, amount: ${payload.amount} ${payload.currency}`,
    );

    return {
      paymentId: params.orderId, // Will be replaced by PaymentService with actual payment ID
      gatewayTransactionId,
      flowType: PaymentFlowType.HOSTED_PAGE,
      redirectUrl: redirectUrl.toString(),
      metadata: {
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
        rawGatewayRequest: payload,
      },
    };
  }

  /**
   * Verify callback from bank gateway
   * Validates signature and extracts payment information
   */
  async verifyCallback(
    callbackData: Record<string, any>,
    config: PaymentMethodConfig,
  ): Promise<CallbackVerificationResult> {
    const bankConfig = this.validateConfig(config.config as BankHostedConfig);

    try {
      // Extract callback fields
      const fields = this.extractCallbackFields(callbackData);

      // Validate required fields
      if (!fields.transactionId || !fields.orderId || !fields.amount || !fields.signature) {
        this.logger.warn(
          `[SECURITY] ${this.getProviderCode()} callback missing required fields: ` +
            `transactionId=${fields.transactionId}, orderId=${fields.orderId}, ` +
            `amount=${fields.amount}, signature=${!!fields.signature}. ` +
            `Full callback data: ${JSON.stringify(callbackData)}`,
        );
        return {
          isValid: false,
          paymentId: fields.orderId,
          gatewayTransactionId: fields.transactionId,
          amount: parseFloat(fields.amount) || 0,
          currency: fields.currency,
          status: PaymentStatus.FAILED,
          gatewayResponse: callbackData,
          error: 'Missing required callback fields',
        };
      }

      // Verify signature
      const calculatedSignature = this.generateCallbackSignature(
        callbackData,
        bankConfig.secretKey,
      );

      if (calculatedSignature !== fields.signature) {
        this.logger.error(
          `[SECURITY] ${this.getProviderCode()} callback signature mismatch for transaction ${fields.transactionId}, order ${fields.orderId}. ` +
            `Expected: ${calculatedSignature.substring(0, 8)}..., Received: ${fields.signature.substring(0, 8)}... ` +
            `IP/Request: ${JSON.stringify(callbackData)}`,
        );
        return {
          isValid: false,
          paymentId: fields.orderId,
          gatewayTransactionId: fields.transactionId,
          amount: parseFloat(fields.amount) || 0,
          currency: fields.currency,
          status: PaymentStatus.FAILED,
          gatewayResponse: callbackData,
          error: 'Signature verification failed',
        };
      }

      // Map bank status to PaymentStatus
      const paymentStatus = this.mapBankStatus(fields.status);

      this.logger.log(
        `${this.getProviderCode()} callback verified: transaction ${fields.transactionId} for order ${fields.orderId}, ` +
          `status: ${fields.status} (mapped to ${paymentStatus})`,
      );

      return {
        isValid: true,
        paymentId: fields.orderId,
        gatewayTransactionId: fields.transactionId,
        amount: parseFloat(fields.amount),
        currency: fields.currency,
        status: paymentStatus,
        gatewayResponse: callbackData,
        error: paymentStatus === PaymentStatus.FAILED ? (fields.message || 'Payment failed') : undefined,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to verify ${this.getProviderCode()} callback: ${error.message}`,
        error.stack,
      );
      return {
        isValid: false,
        paymentId: callbackData.orderId || callbackData.orderRef || '',
        gatewayTransactionId: callbackData.transactionId || callbackData.transactionRef || '',
        amount: parseFloat(callbackData.amount || callbackData.orderAmount || '0'),
        currency: callbackData.currency || 'PKR',
        status: PaymentStatus.FAILED,
        gatewayResponse: callbackData,
        error: error.message || 'Callback verification error',
      };
    }
  }

  /**
   * Validate bank configuration
   */
  protected validateConfig(config: any): BankHostedConfig {
    if (
      !config.merchantId ||
      !config.terminalId ||
      !config.secretKey ||
      !config.paymentUrl
    ) {
      throw new Error(
        `${this.getProviderCode()} configuration incomplete. Required: merchantId, terminalId, secretKey, paymentUrl`,
      );
    }

    return config as BankHostedConfig;
  }
}


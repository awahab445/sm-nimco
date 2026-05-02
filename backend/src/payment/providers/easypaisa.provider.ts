import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import {
  PaymentFlowType,
  PaymentIntentResult,
  CallbackVerificationResult,
  CreateIntentParams,
  PaymentMethodConfig,
  PaymentStatus,
  PaymentProviderCode,
} from '../types/payment.types';

/**
 * EasyPaisa Payment Gateway Provider
 * 
 * Implements REDIRECT flow for EasyPaisa payments in Pakistan.
 * 
 * Configuration format (stored in payment_methods.config):
 * {
 *   "merchantId": "EP12345",
 *   "storeId": "STORE001",
 *   "secretKey": "EASYPAISA_SECRET",
 *   "paymentUrl": "https://easypaisa.com.pk/payment",
 *   "callbackUrl": "/payments/callback/easypaisa"
 * }
 * 
 * Payment Status Mapping:
 * - SUCCESS → captured
 * - PENDING → processing (authorized but not yet captured)
 * - FAILED → failed
 */
@Injectable()
export class EasyPaisaProvider implements PaymentProvider {
  private readonly logger = new Logger(EasyPaisaProvider.name);

  getProviderCode(): string {
    return PaymentProviderCode.EASYPAISA;
  }

  getFlowType(): PaymentFlowType {
    return PaymentFlowType.REDIRECT;
  }

  /**
   * Generate HMAC-SHA256 checksum for EasyPaisa
   * Hash includes: merchantId, transactionId, amount, storeId
   */
  private generateChecksum(
    merchantId: string,
    transactionId: string,
    amount: string,
    storeId: string,
    secretKey: string,
  ): string {
    // Build hash string in order: merchantId, transactionId, amount, storeId
    const hashString = [merchantId, transactionId, amount, storeId].join('&');
    
    // Generate HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(hashString);
    return hmac.digest('hex');
  }

  /**
   * Create payment intent and generate redirect URL
   */
  async createIntent(
    params: CreateIntentParams,
    config: PaymentMethodConfig,
  ): Promise<PaymentIntentResult> {
    const easypaisaConfig = config.config as {
      merchantId: string;
      storeId: string;
      secretKey: string;
      paymentUrl: string;
      callbackUrl?: string;
    };

    // Validate required configuration
    if (!easypaisaConfig.merchantId || !easypaisaConfig.storeId || !easypaisaConfig.secretKey || !easypaisaConfig.paymentUrl) {
      throw new Error('EasyPaisa configuration incomplete. Required: merchantId, storeId, secretKey, paymentUrl');
    }

    // Generate unique transaction reference
    const gatewayTransactionId = `EP${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Format amount to 2 decimal places
    const amount = params.amount.toFixed(2);

    // Generate checksum using HMAC-SHA256
    const checksum = this.generateChecksum(
      easypaisaConfig.merchantId,
      gatewayTransactionId,
      amount,
      easypaisaConfig.storeId,
      easypaisaConfig.secretKey,
    );

    // Build payment request payload
    const paymentData = {
      merchantId: easypaisaConfig.merchantId,
      storeId: easypaisaConfig.storeId,
      transactionId: gatewayTransactionId,
      orderId: params.orderId,
      amount: amount,
      currency: params.currency || 'PKR',
      customerEmail: params.customerEmail,
      customerName: params.customerName || '',
      description: `Order ${params.metadata?.orderNumber || params.orderId}`,
      returnUrl: params.returnUrl || '',
      checksum: checksum,
    };

    // Build redirect URL with payment parameters
    const redirectUrl = new URL(easypaisaConfig.paymentUrl);
    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        redirectUrl.searchParams.append(key, String(value));
      }
    });

    this.logger.log(
      `EasyPaisa payment intent created: ${gatewayTransactionId} for order ${params.orderId}, amount: ${amount} ${params.currency}`,
    );

    return {
      paymentId: params.orderId, // Will be replaced by PaymentService with actual payment ID
      gatewayTransactionId,
      flowType: PaymentFlowType.REDIRECT,
      redirectUrl: redirectUrl.toString(),
      metadata: {
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
        rawGatewayRequest: paymentData,
      },
    };
  }

  /**
   * Verify callback from EasyPaisa gateway
   * Validates checksum and extracts payment information
   */
  async verifyCallback(
    callbackData: Record<string, any>,
    config: PaymentMethodConfig,
  ): Promise<CallbackVerificationResult> {
    const easypaisaConfig = config.config as {
      merchantId: string;
      storeId: string;
      secretKey: string;
    };

    // Validate required configuration
    if (!easypaisaConfig.merchantId || !easypaisaConfig.storeId || !easypaisaConfig.secretKey) {
      throw new Error('EasyPaisa configuration incomplete. Required: merchantId, storeId, secretKey');
    }

    try {
      // Extract callback parameters (EasyPaisa may send these in various formats)
      const transactionId = callbackData.transactionId || callbackData.transactionRefNumber || callbackData.txnRefNo || '';
      const orderId = callbackData.orderId || callbackData.billReference || '';
      const amount = callbackData.amount || callbackData.orderAmount || callbackData.txnAmount || '0';
      const status = callbackData.status || callbackData.responseCode || callbackData.paymentStatus || '';
      const receivedChecksum = callbackData.checksum || callbackData.hash || callbackData.signature || '';
      const responseMessage = callbackData.message || callbackData.responseMessage || '';

      // Validate required fields
      if (!transactionId || !orderId || !amount || !receivedChecksum) {
        // Security: Log suspicious callback attempt with missing required fields
        this.logger.warn(
          `[SECURITY] EasyPaisa callback missing required fields: transactionId=${transactionId}, orderId=${orderId}, amount=${amount}, checksum=${!!receivedChecksum}. ` +
          `Full callback data: ${JSON.stringify(callbackData)}`,
        );
        return {
          isValid: false,
          paymentId: orderId,
          gatewayTransactionId: transactionId,
          amount: parseFloat(amount) || 0,
          currency: callbackData.currency || 'PKR',
          status: PaymentStatus.FAILED,
          gatewayResponse: callbackData,
          error: 'Missing required callback fields',
        };
      }

      // Verify checksum using HMAC-SHA256
      const calculatedChecksum = this.generateChecksum(
        easypaisaConfig.merchantId,
        transactionId,
        amount,
        easypaisaConfig.storeId,
        easypaisaConfig.secretKey,
      );

      if (calculatedChecksum !== receivedChecksum) {
        // Security: Log suspicious callback attempt with checksum mismatch
        this.logger.error(
          `[SECURITY] EasyPaisa callback checksum mismatch for transaction ${transactionId}, order ${orderId}. ` +
          `Expected: ${calculatedChecksum.substring(0, 8)}..., Received: ${receivedChecksum.substring(0, 8)}... ` +
          `IP/Request: ${JSON.stringify(callbackData)}`,
        );
        return {
          isValid: false,
          paymentId: orderId,
          gatewayTransactionId: transactionId,
          amount: parseFloat(amount) || 0,
          currency: callbackData.currency || 'PKR',
          status: PaymentStatus.FAILED,
          gatewayResponse: callbackData,
          error: 'Checksum verification failed',
        };
      }

      // Map EasyPaisa status to PaymentStatus
      // Status values may vary: "SUCCESS", "00", "000", "PENDING", "FAILED", etc.
      const statusUpper = String(status).toUpperCase();
      let paymentStatus: PaymentStatus;
      
      if (statusUpper === 'SUCCESS' || statusUpper === '00' || statusUpper === '000' || statusUpper === 'COMPLETED') {
        paymentStatus = PaymentStatus.CAPTURED;
      } else if (statusUpper === 'PENDING' || statusUpper === 'PROCESSING' || statusUpper === 'AUTHORIZED') {
        paymentStatus = PaymentStatus.PROCESSING; // Maps to "processing" since "authorized" doesn't exist in enum
      } else {
        paymentStatus = PaymentStatus.FAILED;
      }

      this.logger.log(
        `EasyPaisa callback verified: transaction ${transactionId} for order ${orderId}, status: ${status} (mapped to ${paymentStatus})`,
      );

      return {
        isValid: true,
        paymentId: orderId,
        gatewayTransactionId: transactionId,
        amount: parseFloat(amount),
        currency: callbackData.currency || 'PKR',
        status: paymentStatus,
        gatewayResponse: callbackData,
        error: paymentStatus === PaymentStatus.FAILED ? (responseMessage || 'Payment failed') : undefined,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to verify EasyPaisa callback: ${error.message}`,
        error.stack,
      );
      return {
        isValid: false,
        paymentId: callbackData.orderId || callbackData.billReference || '',
        gatewayTransactionId: callbackData.transactionId || callbackData.transactionRefNumber || '',
        amount: parseFloat(callbackData.amount || callbackData.orderAmount || '0'),
        currency: callbackData.currency || 'PKR',
        status: PaymentStatus.FAILED,
        gatewayResponse: callbackData,
        error: error.message || 'Callback verification error',
      };
    }
  }
}


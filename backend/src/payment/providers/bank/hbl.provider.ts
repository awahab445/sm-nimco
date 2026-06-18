import { Injectable } from '@nestjs/common';
import { BankHostedBaseProvider } from './bank-hosted.base';
import { PaymentProviderCode, PaymentStatus } from '../../types/payment.types';
import { CreateIntentParams, PaymentMethodConfig } from '../../types/payment.types';
import { APP_CURRENCY } from '../../../common/currency';
import * as crypto from 'crypto';

/**
 * HBL (Habib Bank Limited) Payment Gateway Provider
 * 
 * Implements HOSTED_PAGE flow for HBL payments in Pakistan.
 * 
 * Configuration format (stored in payment_methods.config):
 * {
 *   "merchantId": "HBL12345",
 *   "terminalId": "TERM001",
 *   "secretKey": "HBL_SECRET_KEY",
 *   "paymentUrl": "https://hbl.com/payment",
 *   "callbackUrl": "/payments/callback/hbl"
 * }
 * 
 * Payment Status Mapping:
 * - SUCCESS / 00 / APPROVED → captured
 * - PENDING / PROCESSING → processing
 * - FAILED / DECLINED → failed
 */
@Injectable()
export class HblProvider extends BankHostedBaseProvider {
  constructor() {
    super('HblProvider');
  }

  getProviderCode(): string {
    return PaymentProviderCode.HBL;
  }

  /**
   * HBL-specific signature generation
   * Uses HMAC-SHA256 with specific field order
   */
  protected generateSignature(
    payload: Record<string, string>,
    secretKey: string,
  ): string {
    // HBL signature order: merchantId, terminalId, orderId, transactionId, amount, currency
    const signatureFields = [
      'merchantId',
      'terminalId',
      'orderId',
      'transactionId',
      'amount',
      'currency',
    ];

    const signatureString = signatureFields
      .map((field) => `${field}=${payload[field] || ''}`)
      .join('&');

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signatureString);
    return hmac.digest('hex').toUpperCase();
  }

  /**
   * HBL-specific callback signature verification
   */
  protected generateCallbackSignature(
    callbackData: Record<string, any>,
    secretKey: string,
  ): string {
    // HBL callback signature order: transactionId, orderId, amount, status, currency
    const signatureFields = [
      'transactionId',
      'orderId',
      'amount',
      'status',
      'currency',
    ];

    const signatureString = signatureFields
      .map((field) => {
        const value = callbackData[field] || callbackData[field.toLowerCase()] || '';
        return `${field}=${value}`;
      })
      .join('&');

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signatureString);
    return hmac.digest('hex').toUpperCase();
  }

  /**
   * HBL-specific redirect payload
   */
  protected buildRedirectPayload(
    params: CreateIntentParams,
    config: any,
    gatewayTransactionId: string,
  ): Record<string, string> {
    const amount = params.amount.toFixed(2);

    return {
      merchantId: config.merchantId,
      terminalId: config.terminalId,
      orderId: params.orderId,
      transactionId: gatewayTransactionId,
      amount: amount,
      currency: params.currency || APP_CURRENCY,
      customerEmail: params.customerEmail,
      customerName: params.customerName || '',
      successUrl: params.returnUrl || '',
      failureUrl: params.cancelUrl || '',
      description: `Order ${params.metadata?.orderNumber || params.orderId}`,
    };
  }

  /**
   * HBL-specific callback field extraction
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
        '',
      currency: callbackData.currency || APP_CURRENCY,
      message:
        callbackData.message ||
        callbackData.responseMessage ||
        callbackData.description ||
        undefined,
    };
  }

  /**
   * HBL-specific status mapping
   */
  protected mapBankStatus(bankStatus: string): PaymentStatus {
    const statusUpper = String(bankStatus).toUpperCase().trim();

    // HBL success indicators
    if (
      statusUpper === 'SUCCESS' ||
      statusUpper === '00' ||
      statusUpper === '000' ||
      statusUpper === 'APPROVED' ||
      statusUpper === 'AUTHORIZED'
    ) {
      return PaymentStatus.CAPTURED;
    }

    // HBL pending indicators
    if (
      statusUpper === 'PENDING' ||
      statusUpper === 'PROCESSING' ||
      statusUpper === 'IN_PROGRESS' ||
      statusUpper === 'AWAITING_CONFIRMATION'
    ) {
      return PaymentStatus.PROCESSING;
    }

    // HBL failure indicators
    return PaymentStatus.FAILED;
  }
}


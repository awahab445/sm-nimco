import { Injectable } from '@nestjs/common';
import { BankHostedBaseProvider } from './bank-hosted.base';
import { PaymentProviderCode, PaymentStatus } from '../../types/payment.types';
import { CreateIntentParams } from '../../types/payment.types';
import * as crypto from 'crypto';

/**
 * UBL (United Bank Limited) Payment Gateway Provider
 * 
 * Implements HOSTED_PAGE flow for UBL payments in Pakistan.
 * 
 * Configuration format (stored in payment_methods.config):
 * {
 *   "merchantId": "UBL12345",
 *   "terminalId": "TERM001",
 *   "secretKey": "UBL_SECRET_KEY",
 *   "paymentUrl": "https://ubl.com/payment",
 *   "callbackUrl": "/payments/callback/ubl"
 * }
 * 
 * Payment Status Mapping:
 * - SUCCESS / 00 / COMPLETED → captured
 * - PENDING / PROCESSING → processing
 * - FAILED / DECLINED → failed
 */
@Injectable()
export class UblProvider extends BankHostedBaseProvider {
  constructor() {
    super('UblProvider');
  }

  getProviderCode(): string {
    return PaymentProviderCode.UBL;
  }

  /**
   * UBL-specific signature generation
   * Uses HMAC-SHA256 with specific field order
   */
  protected generateSignature(
    payload: Record<string, string>,
    secretKey: string,
  ): string {
    // UBL signature order: merchantId, terminalId, orderId, transactionId, amount, currency, customerEmail
    const signatureFields = [
      'merchantId',
      'terminalId',
      'orderId',
      'transactionId',
      'amount',
      'currency',
      'customerEmail',
    ];

    const signatureString = signatureFields
      .map((field) => `${field}=${payload[field] || ''}`)
      .join('&');

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signatureString);
    return hmac.digest('hex').toUpperCase();
  }

  /**
   * UBL-specific callback signature verification
   */
  protected generateCallbackSignature(
    callbackData: Record<string, any>,
    secretKey: string,
  ): string {
    // UBL callback signature order: transactionId, orderId, amount, status, currency, responseCode
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
   * UBL-specific redirect payload
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
      currency: params.currency || 'PKR',
      customerEmail: params.customerEmail,
      customerName: params.customerName || '',
      successUrl: params.returnUrl || '',
      failureUrl: params.cancelUrl || '',
      description: `Order ${params.metadata?.orderNumber || params.orderId}`,
    };
  }

  /**
   * UBL-specific callback field extraction
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
   * UBL-specific status mapping
   */
  protected mapBankStatus(bankStatus: string): PaymentStatus {
    const statusUpper = String(bankStatus).toUpperCase().trim();

    // UBL success indicators
    if (
      statusUpper === 'SUCCESS' ||
      statusUpper === '00' ||
      statusUpper === '000' ||
      statusUpper === 'COMPLETED' ||
      statusUpper === 'APPROVED'
    ) {
      return PaymentStatus.CAPTURED;
    }

    // UBL pending indicators
    if (
      statusUpper === 'PENDING' ||
      statusUpper === 'PROCESSING' ||
      statusUpper === 'IN_PROGRESS' ||
      statusUpper === 'AWAITING_CONFIRMATION'
    ) {
      return PaymentStatus.PROCESSING;
    }

    // UBL failure indicators
    return PaymentStatus.FAILED;
  }
}


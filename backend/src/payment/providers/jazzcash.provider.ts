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

@Injectable()
export class JazzCashProvider implements PaymentProvider {
  private readonly logger = new Logger(JazzCashProvider.name);

  getProviderCode(): string {
    return PaymentProviderCode.JAZZCASH;
  }

  getFlowType(): PaymentFlowType {
    return PaymentFlowType.REDIRECT;
  }

  async createIntent(
    params: CreateIntentParams,
    config: PaymentMethodConfig,
  ): Promise<PaymentIntentResult> {
    const jazzcashConfig = config.config as {
      merchantId: string;
      password: string;
      integritySalt: string;
      apiEndpoint: string;
      returnUrl: string;
      cancelUrl?: string;
    };

    if (!jazzcashConfig.merchantId || !jazzcashConfig.password || !jazzcashConfig.integritySalt) {
      throw new Error('JazzCash configuration incomplete');
    }

    const gatewayTransactionId = `JC${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Build payment request
    const paymentData = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: jazzcashConfig.merchantId,
      pp_SubMerchantID: '',
      pp_Password: jazzcashConfig.password,
      pp_TxnRefNo: gatewayTransactionId,
      pp_Amount: params.amount.toFixed(2),
      pp_TxnCurrency: params.currency === 'PKR' ? 'PKR' : 'PKR', // JazzCash typically uses PKR
      pp_TxnDateTime: new Date().toISOString().replace(/[-:]/g, '').split('.')[0],
      pp_BillReference: params.orderId,
      pp_Description: `Order ${params.orderId}`,
      pp_TxnExpiryDateTime: new Date(Date.now() + 30 * 60 * 1000)
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0], // 30 minutes expiry
      pp_ReturnURL: params.returnUrl || jazzcashConfig.returnUrl,
      pp_SecureHash: '', // Will be calculated
      ppmpf_1: params.customerEmail,
      ppmpf_2: params.customerName || '',
      ppmpf_3: '',
      ppmpf_4: '',
      ppmpf_5: '',
    };

    // Generate secure hash (order matters: Salt + Amount + BillRef + CustomerID + MerchantID + Password + ReturnURL + Currency + DateTime + ExpiryDateTime + TxnRefNo + TxnType + Version)
    const hashString = [
      jazzcashConfig.integritySalt,
      paymentData.pp_Amount,
      paymentData.pp_BillReference,
      '', // pp_CustomerID (empty for new transactions)
      paymentData.pp_MerchantID,
      paymentData.pp_Password,
      paymentData.pp_ReturnURL,
      paymentData.pp_TxnCurrency,
      paymentData.pp_TxnDateTime,
      paymentData.pp_TxnExpiryDateTime,
      paymentData.pp_TxnRefNo,
      paymentData.pp_TxnType,
      paymentData.pp_Version,
    ].join('&');

    const secureHash = crypto.createHash('sha256').update(hashString).digest('hex');
    paymentData.pp_SecureHash = secureHash;

    // Build redirect URL
    const redirectUrl = new URL(jazzcashConfig.apiEndpoint);
    Object.entries(paymentData).forEach(([key, value]) => {
      if (value) {
        redirectUrl.searchParams.append(key, String(value));
      }
    });

    this.logger.log(
      `JazzCash payment intent created: ${gatewayTransactionId} for order ${params.orderId}`,
    );

    return {
      paymentId: params.orderId, // Will be replaced by service
      gatewayTransactionId,
      flowType: PaymentFlowType.REDIRECT,
      redirectUrl: redirectUrl.toString(),
      metadata: {
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
      },
    };
  }

  async verifyCallback(
    callbackData: Record<string, any>,
    config: PaymentMethodConfig,
  ): Promise<CallbackVerificationResult> {
    const jazzcashConfig = config.config as {
      integritySalt: string;
    };

    if (!jazzcashConfig.integritySalt) {
      throw new Error('JazzCash integrity salt not configured');
    }

    try {
      const {
        pp_ResponseCode,
        pp_ResponseMessage,
        pp_TxnRefNo,
        pp_BillReference,
        pp_Amount,
        pp_TxnCurrency,
        pp_SecureHash: receivedHash,
      } = callbackData;

      // Verify secure hash
      const hashString = [
        jazzcashConfig.integritySalt,
        pp_Amount,
        pp_BillReference,
        callbackData.pp_CustomerID || '',
        callbackData.pp_MerchantID || '',
        callbackData.pp_Password || '',
        callbackData.pp_ReturnURL || '',
        pp_TxnCurrency,
        callbackData.pp_TxnDateTime || '',
        callbackData.pp_TxnExpiryDateTime || '',
        pp_TxnRefNo,
        callbackData.pp_TxnType || '',
        callbackData.pp_Version || '',
      ].join('&');

      const calculatedHash = crypto.createHash('sha256').update(hashString).digest('hex');

      if (calculatedHash !== receivedHash) {
        this.logger.warn(`JazzCash callback hash mismatch for order ${pp_BillReference}`);
        return {
          isValid: false,
          paymentId: pp_BillReference || '',
          gatewayTransactionId: pp_TxnRefNo || '',
          amount: parseFloat(pp_Amount || '0'),
          currency: pp_TxnCurrency || 'PKR',
          status: PaymentStatus.FAILED,
          gatewayResponse: callbackData,
          error: 'Hash verification failed',
        };
      }

      // Check response code (000 typically means success)
      const isSuccess = pp_ResponseCode === '000' || pp_ResponseCode === '00';

      this.logger.log(
        `JazzCash callback verified: ${pp_TxnRefNo} for order ${pp_BillReference}, status: ${pp_ResponseCode}`,
      );

      return {
        isValid: true,
        paymentId: pp_BillReference || '',
        gatewayTransactionId: pp_TxnRefNo || '',
        amount: parseFloat(pp_Amount || '0'),
        currency: pp_TxnCurrency || 'PKR',
        status: isSuccess ? PaymentStatus.CAPTURED : PaymentStatus.FAILED,
        gatewayResponse: callbackData,
        error: isSuccess ? undefined : pp_ResponseMessage || 'Payment failed',
      };
    } catch (error: any) {
      this.logger.error(`Failed to verify JazzCash callback: ${error.message}`, error);
      return {
        isValid: false,
        paymentId: callbackData.pp_BillReference || '',
        gatewayTransactionId: callbackData.pp_TxnRefNo || '',
        amount: parseFloat(callbackData.pp_Amount || '0'),
        currency: callbackData.pp_TxnCurrency || 'PKR',
        status: PaymentStatus.FAILED,
        gatewayResponse: callbackData,
        error: error.message,
      };
    }
  }
}


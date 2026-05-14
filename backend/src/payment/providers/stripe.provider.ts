import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
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
import { randomUUID } from 'crypto';

export interface StripeCallbackContext {
  rawBody?: Buffer;
  signature?: string;
}

@Injectable()
export class StripeProvider implements PaymentProvider {
  private readonly logger = new Logger(StripeProvider.name);

  getProviderCode(): string {
    return PaymentProviderCode.STRIPE;
  }

  getFlowType(): PaymentFlowType {
    return PaymentFlowType.CLIENT_SECRET;
  }

  async createIntent(
    params: CreateIntentParams,
    config: PaymentMethodConfig,
  ): Promise<PaymentIntentResult> {
    const stripeConfig = config.config as {
      secretKey: string;
      publishableKey?: string;
    };

    if (!stripeConfig.secretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2025-02-24.acacia',
    });

    const gatewayTransactionId = randomUUID();

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency.toLowerCase(),
        metadata: {
          orderId: params.orderId,
          gatewayTransactionId,
          customerEmail: params.customerEmail,
          ...params.metadata,
        },
        description: `Order ${params.orderId}`,
        receipt_email: params.customerEmail,
      });

      this.logger.log(
        `Stripe payment intent created: ${paymentIntent.id} for order ${params.orderId}`,
      );

      return {
        paymentId: params.orderId, // Will be replaced by service
        gatewayTransactionId: paymentIntent.id,
        flowType: PaymentFlowType.CLIENT_SECRET,
        clientSecret: paymentIntent.client_secret || undefined,
        metadata: {
          paymentIntentId: paymentIntent.id,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to create Stripe payment intent: ${error.message}`, error);
      throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
  }

  async verifyCallback(
    callbackData: Record<string, any>,
    config: PaymentMethodConfig,
    context?: StripeCallbackContext,
  ): Promise<CallbackVerificationResult> {
    const stripeConfig = config.config as {
      secretKey: string;
      webhookSecret?: string;
    };

    if (!stripeConfig.secretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2025-02-24.acacia',
    });

    let event: Stripe.Event;

    try {
      if (stripeConfig.webhookSecret) {
        if (!context?.rawBody || !context.signature) {
          return {
            isValid: false,
            paymentId: '',
            gatewayTransactionId: '',
            amount: 0,
            currency: '',
            status: PaymentStatus.FAILED,
            gatewayResponse: callbackData,
            error: 'Stripe webhook signature verification requires raw body and stripe-signature header',
          };
        }
        event = stripe.webhooks.constructEvent(
          context.rawBody,
          context.signature,
          stripeConfig.webhookSecret,
        );
      } else if (process.env.NODE_ENV === 'production') {
        return {
          isValid: false,
          paymentId: '',
          gatewayTransactionId: '',
          amount: 0,
          currency: '',
          status: PaymentStatus.FAILED,
          gatewayResponse: callbackData,
          error: 'Stripe webhookSecret must be configured in production',
        };
      } else {
        event = callbackData as Stripe.Event;
      }

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        return {
          isValid: true,
          paymentId: paymentIntent.metadata?.orderId || '',
          gatewayTransactionId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency.toUpperCase(),
          status: PaymentStatus.CAPTURED,
          gatewayResponse: paymentIntent as any,
        };
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        return {
          isValid: true,
          paymentId: paymentIntent.metadata?.orderId || '',
          gatewayTransactionId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: PaymentStatus.FAILED,
          gatewayResponse: paymentIntent as any,
          error: paymentIntent.last_payment_error?.message || 'Payment failed',
        };
      }

      return {
        isValid: false,
        paymentId: '',
        gatewayTransactionId: '',
        amount: 0,
        currency: '',
        status: PaymentStatus.FAILED,
        gatewayResponse: event as any,
        error: `Unhandled event type: ${event.type}`,
      };
    } catch (error: any) {
      this.logger.error(`Failed to verify Stripe callback: ${error.message}`, error);
      return {
        isValid: false,
        paymentId: '',
        gatewayTransactionId: '',
        amount: 0,
        currency: '',
        status: PaymentStatus.FAILED,
        gatewayResponse: callbackData,
        error: error.message,
      };
    }
  }

  async capture(paymentId: string, config: PaymentMethodConfig): Promise<boolean> {
    // Stripe payments are captured automatically, but we can implement manual capture if needed
    this.logger.warn('Stripe capture not implemented - payments are auto-captured');
    return false;
  }

  async refund(
    paymentId: string,
    amount: number,
    config: PaymentMethodConfig,
  ): Promise<boolean> {
    const stripeConfig = config.config as {
      secretKey: string;
    };

    if (!stripeConfig.secretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2025-02-24.acacia',
    });

    try {
      await stripe.refunds.create({
        payment_intent: paymentId,
        amount: Math.round(amount * 100), // Convert to cents
      });

      this.logger.log(`Stripe refund processed for payment ${paymentId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to process Stripe refund: ${error.message}`, error);
      return false;
    }
  }
}


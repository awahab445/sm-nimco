import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CheckoutService } from '../services/checkout.service';
import { PaymentFailedEvent } from '../../order/events/order.events';
import { OrderCreatedEvent } from '../../order/events/order.events';
import { CheckoutExpiredEvent } from './checkout.events';

@Injectable()
export class CheckoutEventHandlers {
  private readonly logger = new Logger(CheckoutEventHandlers.name);

  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Handle payment failed event
   * Cancel checkout if payment fails
   */
  @OnEvent('payment.failed')
  async handlePaymentFailed(event: PaymentFailedEvent) {
    try {
      // Find checkout by order ID (stored in order metadata)
      // For now, we'll cancel based on order metadata
      // In production, you might want to maintain a checkout->order mapping
      this.logger.log(
        `Payment failed for order ${event.orderId}. Checkout cancellation should be handled by order service.`,
      );
      // Note: Checkout is already completed at this point, so we don't cancel it
      // The order service handles order cancellation
    } catch (error) {
      this.logger.error(
        `Failed to handle payment failure for order ${event.orderId}:`,
        error,
      );
    }
  }

  /**
   * Handle order created event
   * Finalize checkout (already done in confirmCheckout, but this is for safety)
   */
  @OnEvent('order.domain.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    try {
      this.logger.log(
        `Order created: ${event.orderNumber}. Checkout should already be finalized.`,
      );
      // Checkout is already marked as completed in confirmCheckout
      // This handler is here for potential cleanup or additional processing
    } catch (error) {
      this.logger.error(
        `Failed to handle order creation ${event.orderId}:`,
        error,
      );
    }
  }

  /**
   * Handle checkout expiration
   * Cleanup expired checkout sessions
   */
  @OnEvent('checkout.expired')
  async handleCheckoutExpired(event: CheckoutExpiredEvent) {
    try {
      await this.checkoutService.cancelCheckout(
        event.checkoutId,
        'Session expired',
      );
      this.logger.log(`Checkout ${event.checkoutId} expired and cleaned up`);
    } catch (error) {
      this.logger.error(
        `Failed to handle checkout expiration ${event.checkoutId}:`,
        error,
      );
    }
  }
}

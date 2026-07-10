import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentService } from '../services/payment.service';
import {
  OrderCreatedEvent,
  OrderCancelledEvent,
} from '../../order/events/order.events';
import { PaymentProviderCode } from '../types/payment.types';

/**
 * Payment Event Handlers
 *
 * Handles order lifecycle events for COD payments:
 * - ORDER_CREATED: Create COD payment if payment method is COD
 * - ORDER_DELIVERED: Capture COD payment (handled via order fulfillment status update)
 * - ORDER_CANCELLED: Mark COD payment as failed
 */
@Injectable()
export class PaymentEventHandlers {
  private readonly logger = new Logger(PaymentEventHandlers.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Handle order created event
   * Create COD payment if the order uses COD payment method
   *
   * Note: This assumes the payment intent was already created during checkout.
   * If COD payment doesn't exist, we'll create it here as a fallback.
   */
  @OnEvent('order.domain.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    try {
      this.logger.log(
        `Order created event received: ${event.orderNumber} (${event.orderId})`,
      );

      // Check if COD payment already exists for this order
      const existingPayments = await this.paymentService.getPaymentsByOrder(
        event.orderId,
      );

      // Check if any payment is COD
      const codPayment = existingPayments.find(
        (p) => p.paymentMethod.provider === PaymentProviderCode.COD,
      );

      if (codPayment) {
        this.logger.log(
          `COD payment already exists for order ${event.orderId}: ${codPayment.id}`,
        );
        return;
      }

      // If no COD payment exists, we don't create it here
      // COD payments should be created during checkout via createIntent
      // This handler is mainly for logging and future extensibility
      this.logger.debug(
        `No COD payment found for order ${event.orderId}. Payment should be created during checkout.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle order created event for order ${event.orderId}:`,
        error,
      );
      // Don't throw - order creation should not fail due to payment handler errors
    }
  }

  /**
   * Handle order cancelled event
   * Mark COD payment as failed if it exists and is still pending
   */
  @OnEvent('order.cancelled')
  async handleOrderCancelled(event: OrderCancelledEvent) {
    try {
      this.logger.log(
        `Order cancelled event received: ${event.orderNumber} (${event.orderId})`,
      );

      // Get all payments for this order
      const payments = await this.paymentService.getPaymentsByOrder(
        event.orderId,
      );

      // Find pending COD payments
      const pendingCODPayments = payments.filter(
        (p) =>
          p.paymentMethod.provider === PaymentProviderCode.COD &&
          p.status === 'pending',
      );

      // Mark each pending COD payment as failed
      for (const payment of pendingCODPayments) {
        try {
          await this.paymentService.markCODAsFailed(
            payment.id,
            event.reason || 'Order cancelled',
          );
          this.logger.log(
            `COD payment ${payment.id} marked as failed due to order cancellation`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to mark COD payment ${payment.id} as failed:`,
            error,
          );
          // Continue with other payments
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle order cancelled event for order ${event.orderId}:`,
        error,
      );
      // Don't throw - order cancellation should not fail due to payment handler errors
    }
  }

  /**
   * Handle order delivered event
   * Capture COD payments when order is delivered
   */
  @OnEvent('order.delivered')
  async handleOrderDelivered(event: { orderId: string; orderNumber: string }) {
    try {
      this.logger.log(
        `Order delivered event received: ${event.orderNumber} (${event.orderId})`,
      );

      // Use the payment service method to handle delivery
      await this.paymentService.handleOrderDelivered(event.orderId);
    } catch (error) {
      this.logger.error(
        `Failed to handle order delivered event for order ${event.orderId}:`,
        error,
      );
      // Don't throw - delivery should not fail due to payment handler errors
    }
  }
}

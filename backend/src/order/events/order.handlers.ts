import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderService } from '../services/order.service';
import { PaymentCapturedEvent, PaymentFailedEvent } from './order.events';

@Injectable()
export class OrderEventHandlers {
  private readonly logger = new Logger(OrderEventHandlers.name);

  constructor(private readonly orderService: OrderService) {}

  /**
   * Handle payment captured event
   * Mark order as paid
   */
  @OnEvent('payment.captured')
  async handlePaymentCaptured(event: PaymentCapturedEvent) {
    try {
      await this.orderService.markOrderAsPaid(event.orderId, event.paymentId);
      this.logger.log(
        `Order ${event.orderId} marked as paid after payment capture`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to mark order ${event.orderId} as paid:`,
        error,
      );
    }
  }

  /**
   * Handle payment failed event
   * Cancel order and release stock
   */
  @OnEvent('payment.failed')
  async handlePaymentFailed(event: PaymentFailedEvent) {
    try {
      await this.orderService.cancelOrder(event.orderId, event.reason);
      this.logger.log(
        `Order ${event.orderId} cancelled after payment failure: ${event.reason || 'No reason provided'}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to cancel order ${event.orderId} after payment failure:`,
        error,
      );
    }
  }
}


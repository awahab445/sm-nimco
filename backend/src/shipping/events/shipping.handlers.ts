import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ShippingAssignedEvent,
  ShippingUpdatedEvent,
  OrderShippedEvent,
  OrderDeliveredEvent,
} from './shipping.events';

@Injectable()
export class ShippingEventHandlers {
  private readonly logger = new Logger(ShippingEventHandlers.name);

  /**
   * Handle shipping assigned event
   */
  @OnEvent('shipping.assigned')
  async handleShippingAssigned(event: ShippingAssignedEvent) {
    this.logger.log(
      `Shipping assigned to order ${event.orderId}: shipping ${event.shippingId}, method ${event.shippingMethodId}`,
    );
    // Additional processing can be added here (e.g., notifications, analytics)
  }

  /**
   * Handle shipping updated event
   */
  @OnEvent('shipping.updated')
  async handleShippingUpdated(event: ShippingUpdatedEvent) {
    this.logger.log(
      `Shipping updated for order ${event.orderId}: shipping ${event.shippingId}, status ${event.status}`,
    );
    // Additional processing can be added here
  }

  /**
   * Handle order shipped event
   */
  @OnEvent('order.shipped')
  async handleOrderShipped(event: OrderShippedEvent) {
    this.logger.log(
      `Order ${event.orderId} shipped${event.trackingNumber ? ` with tracking ${event.trackingNumber}` : ''}`,
    );
    // Additional processing can be added here (e.g., send shipping notification email)
  }

  /**
   * Handle order delivered event
   */
  @OnEvent('order.delivered')
  async handleOrderDelivered(event: OrderDeliveredEvent) {
    this.logger.log(
      `Order ${event.orderId} delivered${event.trackingNumber ? ` with tracking ${event.trackingNumber}` : ''}`,
    );
    // Additional processing can be added here (e.g., send delivery confirmation email)
  }
}


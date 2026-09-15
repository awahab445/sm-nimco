import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../../order/events/order.events';
import { FcmService } from '../services/fcm.service';

@Injectable()
export class VendorNotificationHandlers {
  private readonly logger = new Logger(VendorNotificationHandlers.name);

  constructor(private readonly fcmService: FcmService) {}

  @OnEvent('order.domain.created')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      await this.fcmService.notifyStoreOperatorsOfNewOrder({
        orderId: event.orderId,
        orderNumber: event.orderNumber,
        title: 'New Order Received!',
        body: `Order #${event.orderNumber} is waiting.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send FCM for order ${event.orderNumber}: ${message}`,
      );
    }
  }
}

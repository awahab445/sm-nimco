import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../catalog/services/prisma.service';
import { OrderCreatedEvent } from '../order/events/order.events';
import { FcmService } from './fcm.service';

@Injectable()
export class OrderPushHandlers {
  private readonly logger = new Logger(OrderPushHandlers.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmService: FcmService,
  ) {}

  /**
   * Notify store operators when a new order is created (status pending).
   * Failures are logged and never rethrown so checkout is unaffected.
   */
  @OnEvent('order.domain.created')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: event.orderId },
        select: { id: true, orderNumber: true, status: true },
      });

      if (!order) {
        this.logger.warn(
          `Order ${event.orderId} not found; skipping NEW_ORDER FCM push`,
        );
        return;
      }

      // New checkout orders are created as pending; still notify if already
      // moved to processing by a concurrent path.
      if (order.status !== 'pending' && order.status !== 'processing') {
        this.logger.debug(
          `Order ${order.orderNumber} status=${order.status}; skipping NEW_ORDER FCM`,
        );
        return;
      }

      const sessions = await this.prisma.sessionLog.findMany({
        where: {
          fcmToken: { not: null },
          isBlocked: false,
          user: {
            isActive: true,
            isBlocked: false,
          },
        },
        select: { id: true, fcmToken: true },
      });

      const tokens = sessions
        .map((s) => s.fcmToken)
        .filter((t): t is string => Boolean(t?.trim()));

      if (tokens.length === 0) {
        this.logger.debug(
          `No active operator FCM tokens for order ${order.orderNumber}`,
        );
        return;
      }

      const title = 'New Order Received! 🍕';
      const body = `Order #${order.orderNumber} has been placed.`;

      const result = await this.fcmService.sendNewOrderNotification(tokens, {
        title,
        body,
        orderId: order.id,
        type: 'NEW_ORDER',
      });

      this.logger.log(
        `NEW_ORDER FCM for ${order.orderNumber}: ${result.successCount}/${tokens.length} delivered`,
      );

      if (result.invalidTokens.length > 0) {
        await this.prisma.sessionLog.updateMany({
          where: { fcmToken: { in: result.invalidTokens } },
          data: { fcmToken: null },
        });
        this.logger.warn(
          `Cleared ${result.invalidTokens.length} invalid FCM token(s)`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed NEW_ORDER FCM for ${event.orderId}: ${message}`,
      );
    }
  }
}

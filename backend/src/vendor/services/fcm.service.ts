import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getMessaging } from 'firebase-admin/messaging';
import { STORE_OPERATOR_ROLE_SLUG } from '../../admin/constants/permissions';
import { PrismaService } from '../../catalog/services/prisma.service';
import { ensureFirebaseAdmin } from '../../notifications/firebase-admin.init';

export type NewOrderPushPayload = {
  orderId: string;
  orderNumber: string;
  title?: string;
  body?: string;
};

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private ready = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    this.ready = ensureFirebaseAdmin();
  }

  get isReady(): boolean {
    return this.ready;
  }

  async saveOperatorToken(
    vendorUserId: string,
    fcmToken: string,
  ): Promise<void> {
    const token = fcmToken.trim();
    // One device token should map to one operator — clear duplicates first.
    await this.prisma.adminUser.updateMany({
      where: {
        fcmToken: token,
        id: { not: vendorUserId },
      },
      data: {
        fcmToken: null,
        fcmTokenUpdatedAt: null,
      },
    });

    await this.prisma.adminUser.update({
      where: { id: vendorUserId },
      data: {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date(),
      },
    });
  }

  async clearOperatorToken(vendorUserId: string): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id: vendorUserId },
      data: {
        fcmToken: null,
        fcmTokenUpdatedAt: null,
      },
    });
  }

  async notifyStoreOperatorsOfNewOrder(
    payload: NewOrderPushPayload,
  ): Promise<void> {
    if (!this.ready) {
      this.logger.debug(
        `Skipping FCM for order ${payload.orderNumber}: Firebase not ready`,
      );
      return;
    }

    const operators = await this.prisma.adminUser.findMany({
      where: {
        isActive: true,
        fcmToken: { not: null },
        roles: {
          some: { role: { slug: STORE_OPERATOR_ROLE_SLUG } },
        },
      },
      select: { id: true, fcmToken: true, email: true },
    });

    const tokens = operators
      .map((op) => op.fcmToken?.trim())
      .filter((token): token is string => Boolean(token));

    if (tokens.length === 0) {
      this.logger.warn(
        `No store-operator FCM tokens registered for order ${payload.orderNumber}`,
      );
      return;
    }

    const title = payload.title ?? 'New Order Received!';
    const body = payload.body ?? `Order #${payload.orderNumber} is waiting.`;

    const response = await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: {
        type: 'new_order',
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        title,
        body,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'sm_nimco_new_orders',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    });

    this.logger.log(
      `FCM new-order ${payload.orderNumber}: success=${response.successCount} failure=${response.failureCount}`,
    );

    // Drop invalid / unregistered tokens so we do not keep failing forever.
    const staleIds: string[] = [];
    response.responses.forEach((result, index) => {
      if (result.success) return;
      const code = result.error?.code ?? '';
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        const token = tokens[index];
        const owner = operators.find((op) => op.fcmToken === token);
        if (owner) staleIds.push(owner.id);
      } else {
        this.logger.warn(
          `FCM send failed for token[${index}]: ${result.error?.message}`,
        );
      }
    });

    if (staleIds.length > 0) {
      await this.prisma.adminUser.updateMany({
        where: { id: { in: staleIds } },
        data: { fcmToken: null, fcmTokenUpdatedAt: null },
      });
      this.logger.warn(`Cleared ${staleIds.length} stale FCM token(s)`);
    }
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getMessaging } from 'firebase-admin/messaging';
import { ensureFirebaseAdmin } from './firebase-admin.init';

export type NewOrderPushPayload = {
  title: string;
  body: string;
  orderId: string;
  type: 'NEW_ORDER';
};

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private ready = false;

  onModuleInit(): void {
    this.ready = ensureFirebaseAdmin();
  }

  isEnabled(): boolean {
    return this.ready;
  }

  /**
   * Send a data+notification multicast to operator device tokens.
   * Invalid tokens are returned so callers can clear them from SessionLog.
   */
  async sendNewOrderNotification(
    tokens: string[],
    payload: NewOrderPushPayload,
  ): Promise<{ successCount: number; invalidTokens: string[] }> {
    const unique = [
      ...new Set(tokens.map((t) => t.trim()).filter((t) => t.length > 0)),
    ];
    if (unique.length === 0) {
      return { successCount: 0, invalidTokens: [] };
    }
    if (!this.ready) {
      this.logger.warn(
        'FCM is not configured; skipping new-order push notification',
      );
      return { successCount: 0, invalidTokens: [] };
    }

    const invalidTokens: string[] = [];
    let successCount = 0;
    const messaging = getMessaging();

    // FCM multicast supports up to 500 tokens per call.
    const chunkSize = 500;
    for (let i = 0; i < unique.length; i += chunkSize) {
      const chunk = unique.slice(i, i + chunkSize);
      try {
        const response = await messaging.sendEachForMulticast({
          tokens: chunk,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: {
            title: payload.title,
            body: payload.body,
            orderId: payload.orderId,
            type: payload.type,
          },
          android: {
            priority: 'high',
          },
          apns: {
            headers: {
              'apns-priority': '10',
            },
            payload: {
              aps: {
                sound: 'default',
              },
            },
          },
        });

        successCount += response.successCount;
        response.responses.forEach((result, index) => {
          if (result.success) return;
          const code = result.error?.code ?? '';
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            invalidTokens.push(chunk[index]);
          } else {
            this.logger.warn(
              `FCM send failed for token …${chunk[index].slice(-8)}: ${code} ${result.error?.message ?? ''}`,
            );
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`FCM multicast failed: ${message}`);
      }
    }

    return { successCount, invalidTokens };
  }
}

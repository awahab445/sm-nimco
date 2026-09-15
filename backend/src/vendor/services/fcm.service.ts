import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { STORE_OPERATOR_ROLE_SLUG } from '../../admin/constants/permissions';
import { PrismaService } from '../../catalog/services/prisma.service';

export type NewOrderPushPayload = {
  orderId: string;
  orderNumber: string;
  title?: string;
  body?: string;
};

type ServiceAccountJson = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
  [key: string]: unknown;
};

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private ready = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    this.ready = this.initializeFirebase();
  }

  get isReady(): boolean {
    return this.ready;
  }

  private initializeFirebase(): boolean {
    if (admin.apps.length > 0) {
      return true;
    }

    try {
      const jsonInline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
      const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
      const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

      let credential: admin.credential.Credential | undefined;
      let inferredProjectId = projectId;

      if (jsonInline) {
        const parsed = JSON.parse(jsonInline) as ServiceAccountJson;
        credential = admin.credential.cert(parsed as admin.ServiceAccount);
        inferredProjectId = inferredProjectId || parsed.project_id;
      } else if (jsonPath && existsSync(jsonPath)) {
        const parsed = JSON.parse(
          readFileSync(jsonPath, 'utf8'),
        ) as ServiceAccountJson;
        credential = admin.credential.cert(parsed as admin.ServiceAccount);
        inferredProjectId = inferredProjectId || parsed.project_id;
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        credential = admin.credential.applicationDefault();
      }

      if (!credential) {
        this.logger.warn(
          'Firebase Admin not configured (set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH). Push notifications disabled.',
        );
        return false;
      }

      admin.initializeApp({
        credential,
        ...(inferredProjectId ? { projectId: inferredProjectId } : {}),
      });
      this.logger.log('Firebase Admin initialized for FCM');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Firebase Admin init failed: ${message}`);
      return false;
    }
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

    const response = await admin.messaging().sendEachForMulticast({
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

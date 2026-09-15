import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { isAbsolute, resolve } from 'path';
import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

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
    this.initFirebase();
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

  private initFirebase(): void {
    if (getApps().length > 0) {
      this.ready = true;
      return;
    }

    const enabled = process.env.FCM_ENABLED?.trim().toLowerCase();
    if (enabled === 'false' || enabled === '0') {
      this.logger.log('FCM disabled via FCM_ENABLED=false');
      return;
    }

    try {
      const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
      const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY?.trim();
      const credentialsJson = process.env.FIREBASE_CREDENTIALS_JSON?.trim();
      const credentialsPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();

      if (credentialsJson) {
        const parsed = JSON.parse(credentialsJson) as ServiceAccount;
        initializeApp({
          credential: cert(parsed),
        });
        this.ready = true;
        this.logger.log(
          'Firebase Admin initialized from FIREBASE_CREDENTIALS_JSON',
        );
        return;
      }

      if (credentialsPath) {
        const absolutePath = isAbsolute(credentialsPath)
          ? credentialsPath
          : resolve(process.cwd(), credentialsPath);
        if (!existsSync(absolutePath)) {
          throw new Error(
            `FIREBASE_SERVICE_ACCOUNT_PATH not found: ${absolutePath}`,
          );
        }
        const parsed = JSON.parse(
          readFileSync(absolutePath, 'utf8'),
        ) as ServiceAccount;
        initializeApp({
          credential: cert(parsed),
        });
        this.ready = true;
        this.logger.log(`Firebase Admin initialized from path ${absolutePath}`);
        return;
      }

      if (projectId && clientEmail && privateKeyRaw) {
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.ready = true;
        this.logger.log('Firebase Admin initialized from FIREBASE_* env vars');
        return;
      }

      this.logger.warn(
        'Firebase Admin not configured (set FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY or FIREBASE_CREDENTIALS_JSON). New-order FCM pushes are disabled.',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Firebase Admin init failed: ${message}`);
      this.ready = false;
    }
  }
}

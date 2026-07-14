import { createHash } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AnalyticsSettingsService } from '../../analytics/services/analytics-settings.service';
import { APP_CURRENCY } from '../currency';

/** Browser / request context forwarded for Meta matching. */
export type CapiUserData = {
  fbc?: string | null;
  fbp?: string | null;
  client_ip_address?: string | null;
  client_user_agent?: string | null;
  email?: string | null;
  phone?: string | null;
  /** Already-hashed SHA-256 hex values (skip re-hashing). */
  em?: string | string[] | null;
  ph?: string | string[] | null;
  event_source_url?: string | null;
};

/** Product custom_data for ViewContent. */
export type CapiProductData = {
  content_ids?: string[];
  content_id?: string;
  content_name?: string;
  content_type?: string;
  content_category?: string;
  contents?: Array<{ id: string; quantity?: number; item_price?: number }>;
  value?: number;
  currency?: string;
};

export type CapiSendResult = {
  success: boolean;
  skipped?: boolean;
  eventsReceived?: number;
  error?: string;
};

@Injectable()
export class CapiService {
  private readonly logger = new Logger(CapiService.name);
  private readonly apiVersion = 'v20.0';
  private readonly graphBase = 'https://graph.facebook.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly analyticsSettings: AnalyticsSettingsService,
  ) {}

  /**
   * Send a Meta Conversion API ViewContent event (for Pixel deduplication via event_id).
   * Pixel ID comes from AnalyticsSettingsService (admin panel); access token stays in env.
   */
  async sendViewContent(
    eventId: string,
    userData: CapiUserData,
    productData: CapiProductData,
  ): Promise<CapiSendResult> {
    const settings = await this.analyticsSettings.getAdminSettings();
    const pixelId = settings.metaPixelEnabled
      ? settings.metaPixelId?.trim()
      : undefined;
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();

    if (!pixelId || !accessToken) {
      this.logger.warn(
        'Meta CAPI skipped: Meta Pixel is disabled/missing in admin settings, or META_CAPI_ACCESS_TOKEN is not set',
      );
      return { success: false, skipped: true, error: 'CAPI not configured' };
    }

    const contentIds =
      productData.content_ids?.filter(Boolean) ||
      (productData.content_id ? [productData.content_id] : []);

    const event = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url:
        userData.event_source_url?.trim() ||
        process.env.FRONTEND_URL?.replace(/\/$/, '') ||
        undefined,
      action_source: 'website' as const,
      user_data: this.buildUserData(userData),
      custom_data: {
        content_type: productData.content_type || 'product',
        ...(contentIds.length > 0 && { content_ids: contentIds }),
        ...(productData.content_name && {
          content_name: productData.content_name,
        }),
        ...(productData.content_category && {
          content_category: productData.content_category,
        }),
        ...(productData.contents?.length && {
          contents: productData.contents,
        }),
        ...(productData.value != null && Number.isFinite(productData.value)
          ? { value: productData.value }
          : {}),
        currency: (
          productData.currency ||
          APP_CURRENCY ||
          'PKR'
        ).toUpperCase(),
      },
    };

    const url = `${this.graphBase}/${this.apiVersion}/${encodeURIComponent(pixelId)}/events`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<{
          events_received?: number;
          messages?: unknown[];
          fbtrace_id?: string;
        }>(
          url,
          { 
            data: [event],
            // 🌟 TEST_EVENT_CODE added for local testing in Meta Events Manager
           //
          },
          {
            params: { access_token: accessToken },
            timeout: 10_000,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      const eventsReceived = response.data?.events_received ?? 0;
      this.logger.debug(
        `Meta CAPI ViewContent sent (event_id=${eventId}, events_received=${eventsReceived})`,
      );
      return { success: true, eventsReceived };
    } catch (error) {
      return this.handleAxiosError(error, eventId);
    }
  }

  private buildUserData(userData: CapiUserData): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (userData.fbc?.trim()) payload.fbc = userData.fbc.trim();
    if (userData.fbp?.trim()) payload.fbp = userData.fbp.trim();
    if (userData.client_ip_address?.trim()) {
      payload.client_ip_address = userData.client_ip_address.trim();
    }
    if (userData.client_user_agent?.trim()) {
      payload.client_user_agent = userData.client_user_agent.trim();
    }

    const em = this.resolveHashedField(userData.em, userData.email, 'email');
    if (em.length) payload.em = em;

    const ph = this.resolveHashedField(userData.ph, userData.phone, 'phone');
    if (ph.length) payload.ph = ph;

    return payload;
  }

  private resolveHashedField(
    prehashed: string | string[] | null | undefined,
    raw: string | null | undefined,
    kind: 'email' | 'phone',
  ): string[] {
    if (prehashed != null) {
      const list = (Array.isArray(prehashed) ? prehashed : [prehashed])
        .map((v) => String(v).trim().toLowerCase())
        .filter(Boolean);
      return list;
    }
    if (!raw?.trim()) return [];
    const normalized =
      kind === 'email'
        ? raw.trim().toLowerCase()
        : raw.replace(/[^\d+]/g, '').replace(/^\+/, '');
    if (!normalized) return [];
    return [this.hashSha256(normalized)];
  }

  /**
   * Meta requires PII (email, phone, etc.) as lowercase SHA-256 hex digests.
   */
  private hashSha256(value: string): string {
    return createHash('sha256').update(value, 'utf8').digest('hex');
  }

  private handleAxiosError(error: unknown, eventId: string): CapiSendResult {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const metaMessage =
        (error.response?.data as { error?: { message?: string } })?.error
          ?.message || error.message;
      this.logger.error(
        `Meta CAPI request failed (event_id=${eventId}, status=${status ?? 'n/a'}): ${metaMessage}`,
      );
      return {
        success: false,
        error: metaMessage,
      };
    }

    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(
      `Meta CAPI unexpected error (event_id=${eventId}): ${message}`,
    );
    return { success: false, error: message };
  }
}
import { createHash } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AnalyticsSettingsService } from '../../analytics/services/analytics-settings.service';
import { normalizePakistanPhone } from '../utils/pk-phone.util';
import { APP_CURRENCY, toMoneyNumber } from '../currency';
import type {
  CapiEventName,
  CapiProductData,
  CapiSendResult,
  CapiUserData,
} from './capi.service';

// Type-only import from capi.service (it injects this service; avoid a runtime cycle).
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Meta → TikTok standard event names. PageView is deliberately absent:
 * browser `ttq.page()` has no event_id, so a server copy could not dedupe.
 */
const TIKTOK_EVENT_NAMES: Partial<Record<CapiEventName, string>> = {
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  AddPaymentInfo: 'AddPaymentInfo',
  Purchase: 'CompletePayment',
  Search: 'Search',
  CompleteRegistration: 'CompleteRegistration',
};

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/** TikTok wants E.164 with leading `+` before hashing. */
export function toTikTokPhone(raw: string | null | undefined): string | null {
  const digits = normalizePakistanPhone(raw);
  return digits ? `+${digits}` : null;
}

/**
 * Server-side TikTok Events API (v1.3) — mirror of Meta CAPI.
 * Pixel code from admin analytics settings; token from TIKTOK_EVENTS_API_ACCESS_TOKEN.
 * Dedupes with the browser pixel via the shared `event_id`.
 */
@Injectable()
export class TikTokEventsService {
  private readonly logger = new Logger(TikTokEventsService.name);
  private readonly endpoint =
    'https://business-api.tiktok.com/open_api/v1.3/event/track/';

  constructor(
    private readonly httpService: HttpService,
    private readonly analyticsSettings: AnalyticsSettingsService,
  ) {}

  buildPayload(
    pixelCode: string,
    eventName: string,
    eventId: string,
    userData: CapiUserData,
    productData: CapiProductData,
  ): Record<string, unknown> {
    const user: Record<string, string> = {};
    const email = userData.email?.trim().toLowerCase();
    if (email) user.email = sha256(email);
    const phone = toTikTokPhone(userData.phone);
    if (phone) user.phone = sha256(phone);
    const externalId = userData.external_id?.trim();
    if (externalId) user.external_id = sha256(externalId);
    if (userData.client_ip_address?.trim()) {
      user.ip = userData.client_ip_address.trim();
    }
    if (userData.client_user_agent?.trim()) {
      user.user_agent = userData.client_user_agent.trim();
    }
    if (userData.ttp?.trim()) user.ttp = userData.ttp.trim();
    if (userData.ttclid?.trim()) user.ttclid = userData.ttclid.trim();

    // Catalog ids are SKUs only (UUIDs stripped), same rule as Meta.
    const contents = (productData.contents ?? [])
      .filter((c) => {
        const id = String(c.id ?? '').trim();
        return Boolean(id) && !UUID_RE.test(id);
      })
      .map((c) => ({
        content_id: String(c.id).trim(),
        content_type: 'product',
        ...(productData.content_name && productData.contents?.length === 1
          ? { content_name: productData.content_name }
          : {}),
        ...(c.quantity != null ? { quantity: c.quantity } : {}),
        ...(c.item_price != null ? { price: toMoneyNumber(c.item_price) } : {}),
      }));

    const properties: Record<string, unknown> = {
      currency: (productData.currency || APP_CURRENCY || 'PKR').toUpperCase(),
    };
    if (contents.length > 0) {
      properties.contents = contents;
      properties.content_type = 'product';
    }
    if (productData.value != null) {
      const value = toMoneyNumber(productData.value);
      if (Number.isFinite(value)) properties.value = value;
    }
    if (productData.order_id?.trim()) {
      properties.order_id = productData.order_id.trim();
    }

    const url =
      userData.event_source_url?.trim() ||
      process.env.FRONTEND_URL?.replace(/\/$/, '') ||
      undefined;

    const body: Record<string, unknown> = {
      event_source: 'web',
      event_source_id: pixelCode,
      data: [
        {
          event: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId.trim(),
          user,
          ...(url ? { page: { url } } : {}),
          properties,
        },
      ],
    };
    const testEventCode = process.env.TIKTOK_EVENTS_API_TEST_EVENT_CODE?.trim();
    if (testEventCode) body.test_event_code = testEventCode;
    return body;
  }

  async sendEvent(
    eventName: CapiEventName,
    eventId: string,
    userData: CapiUserData,
    productData: CapiProductData = {},
  ): Promise<CapiSendResult> {
    const tiktokEvent = TIKTOK_EVENT_NAMES[eventName];
    if (!tiktokEvent) {
      return { success: false, skipped: true, error: 'Event not mapped' };
    }
    const accessToken = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN?.trim();
    // Without a token, skip silently (no DB read, no log noise for Meta-only stores).
    if (!accessToken) {
      return { success: false, skipped: true, error: 'Not configured' };
    }
    const settings = await this.analyticsSettings.getAdminSettings();
    const pixelCode = settings.tiktokPixelEnabled
      ? settings.tiktokPixelId?.trim()
      : undefined;
    if (!pixelCode) {
      this.logger.warn(
        'TikTok Events API skipped: TikTok Pixel is disabled/missing in admin settings',
      );
      return { success: false, skipped: true, error: 'Pixel disabled' };
    }
    if (!eventId?.trim()) {
      return { success: false, skipped: true, error: 'Missing event_id' };
    }

    const body = this.buildPayload(
      pixelCode,
      tiktokEvent,
      eventId,
      userData,
      productData,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ code?: number; message?: string }>(
          this.endpoint,
          body,
          {
            timeout: 10_000,
            headers: {
              'Content-Type': 'application/json',
              'Access-Token': accessToken,
            },
          },
        ),
      );
      // TikTok returns HTTP 200 with a non-zero `code` on failure.
      const code = response.data?.code ?? -1;
      if (code !== 0) {
        const message = response.data?.message || `code ${code}`;
        this.logger.error(
          `TikTok Events API ${tiktokEvent} rejected (event_id=${eventId}): ${message}`,
        );
        return { success: false, error: message };
      }
      this.logger.debug(
        `TikTok Events API ${tiktokEvent} sent (event_id=${eventId})`,
      );
      return { success: true, eventsReceived: 1 };
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message ||
            error.message
          : error instanceof Error
            ? error.message
            : String(error);
      this.logger.error(
        `TikTok Events API request failed (event_id=${eventId}): ${message}`,
      );
      return { success: false, error: message };
    }
  }

  /** Fire-and-forget; never throws into the request path. */
  enqueue(
    eventName: CapiEventName,
    eventId: string,
    userData: CapiUserData,
    productData?: CapiProductData,
  ): void {
    void this.sendEvent(eventName, eventId, userData, productData).catch(
      (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `TikTok Events API enqueue failed (${eventName}, event_id=${eventId}): ${message}`,
        );
      },
    );
  }
}

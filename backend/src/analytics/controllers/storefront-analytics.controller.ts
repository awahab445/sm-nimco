import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AnalyticsSettingsService } from '../services/analytics-settings.service';
import { CapiService } from '../../common/services/capi.service';
import { MetaCapiClientDto } from '../../common/dto/meta-capi-client.dto';
import { buildCapiUserData } from '../../common/utils/capi-request.util';

@Controller('storefront/analytics-config')
export class StorefrontAnalyticsController {
  constructor(private readonly analyticsSettings: AnalyticsSettingsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  async getConfig() {
    const data = await this.analyticsSettings.getPublicConfig();
    return { data };
  }
}

@Controller('storefront/analytics')
export class StorefrontMetaEventsController {
  constructor(private readonly capiService: CapiService) {}

  /**
   * Browser PageView companion for Meta CAPI (deduped via event_id).
   * Hashes email/phone/name server-side; IP/UA come from the request.
   */
  @Post('pageview')
  @HttpCode(HttpStatus.NO_CONTENT)
  pageView(@Body() body: MetaCapiClientDto, @Req() req: Request): void {
    const eventId = body.eventId?.trim();
    if (!eventId) return;
    this.capiService.enqueue(
      'PageView',
      eventId,
      buildCapiUserData(body, req, {
        email: body.email,
        phone: body.phone,
        first_name: body.firstName,
        last_name: body.lastName,
        external_id: body.externalId,
        fb_login_id: body.fbLoginId,
      }),
    );
  }
}

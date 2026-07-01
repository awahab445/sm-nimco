import { Controller, Get, Header } from '@nestjs/common';
import { AnalyticsSettingsService } from '../services/analytics-settings.service';

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

import { Controller, Get, Header } from '@nestjs/common';
import { SiteConfigService } from '../services/site-config.service';

@Controller('settings/site-config')
export class StorefrontSiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  async getConfig() {
    const data = await this.siteConfigService.getPublicConfig();
    return { data };
  }
}

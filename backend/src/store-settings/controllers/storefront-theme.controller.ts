import { Controller, Get, Header } from '@nestjs/common';
import { StoreSettingsService } from '../services/store-settings.service';

@Controller('settings/theme')
export class StorefrontThemeController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  async getTheme() {
    const data = await this.storeSettingsService.getPublicTheme();
    return { data };
  }
}

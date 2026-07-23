import { Controller, Get, Header } from '@nestjs/common';
import { StoreSettingsService } from '../services/store-settings.service';

@Controller('settings/store')
export class StorefrontStoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  async getStoreSettings() {
    const data = await this.storeSettingsService.getPublicOrderSettings();
    return { data };
  }
}

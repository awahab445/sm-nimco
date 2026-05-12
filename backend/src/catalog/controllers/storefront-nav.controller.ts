import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { StorefrontNavService } from '../services/storefront-nav.service';

/** Public storefront header navigation (no auth). */
@Controller('storefront')
export class StorefrontNavController {
  constructor(private readonly storefrontNavService: StorefrontNavService) {}

  @Get('navigation')
  @HttpCode(HttpStatus.OK)
  async getNavigation() {
    const data = await this.storefrontNavService.findPublic();
    return { data };
  }
}

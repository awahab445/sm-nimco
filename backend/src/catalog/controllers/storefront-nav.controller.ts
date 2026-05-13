import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { StorefrontNavService } from '../services/storefront-nav.service';

@Controller('storefront/navigation')
export class StorefrontNavController {
  constructor(private readonly storefrontNavService: StorefrontNavService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async list() {
    const data = await this.storefrontNavService.findPublic();
    return { data };
  }
}

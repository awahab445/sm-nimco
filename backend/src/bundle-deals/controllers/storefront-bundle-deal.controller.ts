import { Controller, Get, Header, Param } from '@nestjs/common';
import { BundleDealService } from '../services/bundle-deal.service';

@Controller('deals')
export class StorefrontBundleDealController {
  constructor(private readonly bundleDealService: BundleDealService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  async list() {
    const result = await this.bundleDealService.listDeals({ activeOnly: true, limit: 50 });
    return { data: result.data };
  }

  @Get(':slug')
  @Header('Cache-Control', 'public, max-age=60')
  async getBySlug(@Param('slug') slug: string) {
    const deal = await this.bundleDealService.findBySlug(slug);
    return { data: deal };
  }
}

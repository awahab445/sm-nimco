import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { StorefrontFilterService } from '../services/storefront-filter.service';

@Controller('storefront')
export class StorefrontFilterController {
  constructor(
    private readonly storefrontFilterService: StorefrontFilterService,
  ) {}

  @Get('plp-browse-tree')
  @HttpCode(HttpStatus.OK)
  async browseTree() {
    const data = await this.storefrontFilterService.findPublicBrowseTree();
    return { data: data ?? { label: 'Categories', tree: [] } };
  }
}

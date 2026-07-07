import { Controller, Get, Param } from '@nestjs/common';
import { CmsService } from '../services/cms.service';

/** Storefront alias for published CMS pages — GET /pages/:slug */
@Controller('pages')
export class PagesController {
  constructor(private readonly cmsService: CmsService) {}

  @Get(':slug')
  getPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.getPublishedPageBySlug(slug);
  }
}

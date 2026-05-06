import { Controller, Get, Param } from '@nestjs/common';
import { CmsService } from '../services/cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('pages/:slug')
  getPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.getPublishedPageBySlug(slug);
  }

  @Get('blocks/:identifier')
  getBlock(@Param('identifier') identifier: string) {
    return this.cmsService.getActiveBlock(identifier);
  }

  @Get('sliders/:identifier')
  getSlider(@Param('identifier') identifier: string) {
    return this.cmsService.getActiveSlider(identifier);
  }
}

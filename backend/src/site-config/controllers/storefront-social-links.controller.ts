import { Controller, Get, Header } from '@nestjs/common';
import { SocialLinksService } from '../services/social-links.service';

@Controller('settings/social-links')
export class StorefrontSocialLinksController {
  constructor(private readonly socialLinksService: SocialLinksService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  async list() {
    const data = await this.socialLinksService.listPublic();
    return { data };
  }
}

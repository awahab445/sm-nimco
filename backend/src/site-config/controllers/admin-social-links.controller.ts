import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';
import { ReplaceSocialLinksDto } from '../dto/upsert-social-links.dto';
import { SocialLinksService } from '../services/social-links.service';

@Controller('admin/settings/social-links')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminSocialLinksController {
  constructor(private readonly socialLinksService: SocialLinksService) {}

  @Get()
  @RequirePermissions('settings.manage')
  async list() {
    const data = await this.socialLinksService.listAdmin();
    return { data };
  }

  @Put()
  @RequirePermissions('settings.manage')
  async replace(@Body() dto: ReplaceSocialLinksDto) {
    const data = await this.socialLinksService.replaceAll(dto);
    return { data };
  }
}

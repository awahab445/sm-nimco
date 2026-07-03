import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';
import { UpdateThemeDto } from '../dto/update-theme.dto';
import { StoreSettingsService } from '../services/store-settings.service';

type AdminRequest = Request & { user?: { sub?: string; id?: string } };

@Controller('settings/theme')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminThemeController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Patch()
  @RequirePermissions('settings.manage')
  @HttpCode(HttpStatus.OK)
  async updateTheme(@Body() dto: UpdateThemeDto, @Req() req: AdminRequest) {
    const adminUserId = req.user?.sub ?? req.user?.id;
    const data = await this.storeSettingsService.updateTheme(dto.theme, adminUserId);
    return { data };
  }
}

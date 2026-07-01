import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AnalyticsSettingsService } from '../services/analytics-settings.service';
import {
  ToggleGa4SettingsDto,
  UpdateGa4SettingsDto,
} from '../dto/update-ga4-settings.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

type AdminRequest = Request & { user?: { sub?: string; id?: string } };

@Controller('admin/analytics/ga4')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsSettings: AnalyticsSettingsService) {}

  @Get()
  @RequirePermissions('analytics.manage')
  async getSettings() {
    const data = await this.analyticsSettings.getAdminSettings();
    return { data };
  }

  @Patch()
  @RequirePermissions('analytics.manage')
  async updateSettings(
    @Body() dto: UpdateGa4SettingsDto,
    @Req() req: AdminRequest,
  ) {
    const adminUserId = req.user?.sub ?? req.user?.id;
    const data = await this.analyticsSettings.updateSettings(dto, adminUserId);
    return { data };
  }

  @Post('toggle')
  @RequirePermissions('analytics.manage')
  async toggle(
    @Body() dto: ToggleGa4SettingsDto,
    @Req() req: AdminRequest,
  ) {
    const adminUserId = req.user?.sub ?? req.user?.id;
    const data = await this.analyticsSettings.toggleEnabled(dto, adminUserId);
    return { data };
  }
}

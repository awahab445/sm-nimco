import {
  Body,
  Controller,
  Get,
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
import { UpdateStoreOrderSettingsDto } from '../dto/update-store-order-settings.dto';
import { StoreSettingsService } from '../services/store-settings.service';

type AdminRequest = Request & { user?: { sub?: string; id?: string } };

@Controller('admin/settings/store')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminStoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  @RequirePermissions('settings.manage')
  async getOrderSettings() {
    const data = await this.storeSettingsService.getAdminOrderSettings();
    return { data };
  }

  @Patch()
  @RequirePermissions('settings.manage')
  @HttpCode(HttpStatus.OK)
  async updateOrderSettings(
    @Body() dto: UpdateStoreOrderSettingsDto,
    @Req() req: AdminRequest,
  ) {
    const adminUserId = req.user?.sub ?? req.user?.id;
    const data = await this.storeSettingsService.updateOrderSettings(
      dto,
      adminUserId,
    );
    return { data };
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ZoneConfigService } from '../services/zone-config.service';
import { UpdateZoneConfigDto } from '../dto/zone-config.dto';
import { ZoneConfigJson } from '../config/zone-config.types';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

/**
 * Admin nationwide shipping config (Economy & Overland).
 * Base: /admin/shipping/zone-config
 */
@Controller('admin/shipping/zone-config')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminZoneConfigController {
  constructor(private readonly zoneConfigService: ZoneConfigService) {}

  @Get()
  @RequirePermissions('shipping.manage')
  async getConfig() {
    return this.zoneConfigService.getZoneConfig();
  }

  @Put()
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.OK)
  async updateConfig(@Body() dto: UpdateZoneConfigDto) {
    return this.zoneConfigService.updateZoneConfig(dto as ZoneConfigJson);
  }
}

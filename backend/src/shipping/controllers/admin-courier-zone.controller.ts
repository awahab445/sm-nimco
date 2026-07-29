import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CourierCityService } from '../services/courier-city.service';
import { UpdateCourierZoneRatesDto } from '../dto/courier-zone.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

/**
 * Admin courier zone rate management (5kg / 10kg / overage tiers).
 * Base: /admin/shipping/courier-zones
 */
@Controller('admin/shipping/courier-zones')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminCourierZoneController {
  constructor(private readonly courierCityService: CourierCityService) {}

  @Get()
  @RequirePermissions('shipping.manage')
  async listZones() {
    return this.courierCityService.listZones();
  }

  @Put(':id')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.OK)
  async updateZone(
    @Param('id') id: string,
    @Body() dto: UpdateCourierZoneRatesDto,
  ) {
    return this.courierCityService.updateZoneRates(id, dto);
  }
}

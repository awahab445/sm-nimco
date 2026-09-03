import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';
import { assertVendorUser } from '../utils/assert-vendor-user.util';
import { VendorOrderQueryDto } from '../dto/vendor-order-query.dto';
import { VendorUpdateOrderStatusDto } from '../dto/vendor-update-order-status.dto';
import { VendorOrderService } from '../services/vendor-order.service';

@Controller('vendor/orders')
@UseGuards(JwtAuthGuard)
export class VendorOrderController {
  constructor(private readonly vendorOrderService: VendorOrderService) {}

  @Get()
  async findActive(
    @CurrentUser() user: JwtValidatePayload,
    @Query() query: VendorOrderQueryDto,
  ) {
    assertVendorUser(user);
    return this.vendorOrderService.findActiveByStatus(query.status);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @CurrentUser() user: JwtValidatePayload,
    @Param('id') id: string,
    @Body() body: VendorUpdateOrderStatusDto,
  ) {
    assertVendorUser(user);
    return this.vendorOrderService.updateStatus(id, body.status);
  }
}

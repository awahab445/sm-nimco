import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('admin/orders')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * List all orders (admin)
   * GET /admin/orders
   */
  @Get()
  @RequirePermissions('orders.read')
  async findAll(@Query() query: OrderQueryDto) {
    return this.orderService.findAll(query);
  }

  /**
   * Get order by ID (admin)
   * GET /admin/orders/:id
   */
  @Get(':id')
  @RequirePermissions('orders.read')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOneById(id);
  }

  /**
   * Update order status (admin)
   * PUT /admin/orders/:id/status
   */
  @Put(':id/status')
  @RequirePermissions('orders.manage')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, updateDto);
  }
}


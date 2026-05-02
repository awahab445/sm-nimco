import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderQueryDto } from '../dto/order-query.dto';

@Controller('admin/orders')
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * List all orders (admin)
   * GET /admin/orders
   */
  @Get()
  async findAll(@Query() query: OrderQueryDto) {
    return this.orderService.findAll(query);
  }

  /**
   * Get order by ID (admin)
   * GET /admin/orders/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOneById(id);
  }

  /**
   * Update order status (admin)
   * PUT /admin/orders/:id/status
   */
  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, updateDto);
  }
}


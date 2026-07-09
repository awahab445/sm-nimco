import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { ShippingLabelService } from '../services/shipping-label.service';
import { PackageInsertService } from '../services/package-insert.service';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { BulkShippingLabelsDto } from '../dto/bulk-shipping-labels.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { CheckPermission } from '../../admin/decorators/check-permission.decorator';

@Controller('admin/orders')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminOrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly shippingLabelService: ShippingLabelService,
    private readonly packageInsertService: PackageInsertService,
  ) {}

  /**
   * List all orders (admin)
   * GET /admin/orders
   */
  @Get()
  @CheckPermission('orders', 'read')
  async findAll(@Query() query: OrderQueryDto) {
    return this.orderService.findAll(query);
  }

  /**
   * Generate bulk 4x6 shipping labels PDF
   * POST /admin/orders/bulk-shipping-labels
   */
  @Post('bulk-shipping-labels')
  @CheckPermission('orders', 'read')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="shipping-labels.pdf"')
  async bulkShippingLabels(
    @Body() dto: BulkShippingLabelsDto,
  ): Promise<StreamableFile> {
    const pdf = await this.shippingLabelService.generateBulkLabels(dto.orderIds);
    return new StreamableFile(pdf);
  }

  /**
   * Generate bulk 4x6 colorful package insert flyers PDF
   * POST /admin/orders/bulk-package-inserts
   */
  @Post('bulk-package-inserts')
  @CheckPermission('orders', 'read')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="package-inserts.pdf"')
  async bulkPackageInserts(
    @Body() dto: BulkShippingLabelsDto,
  ): Promise<StreamableFile> {
    const pdf = await this.packageInsertService.generateBulkInserts(dto.orderIds);
    return new StreamableFile(pdf);
  }

  /**
   * Get order by ID (admin)
   * GET /admin/orders/:id
   */
  @Get(':id')
  @CheckPermission('orders', 'read')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOneById(id);
  }

  /**
   * Update order status (admin)
   * PUT /admin/orders/:id/status
   */
  @Put(':id/status')
  @CheckPermission('orders', 'update')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, updateDto);
  }
}

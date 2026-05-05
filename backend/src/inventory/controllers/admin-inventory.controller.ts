import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus, BadRequestException, UseGuards } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { AdjustStockDto, DEFAULT_WAREHOUSE_ID } from '../dto/adjust-stock.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('admin/inventory')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Get inventory status for a variant (or simple product when variantId = product id).
   * Use this to verify stock. Storefront uses warehouseId "default-warehouse".
   */
  @Get('status')
  @RequirePermissions('inventory.read')
  @HttpCode(HttpStatus.OK)
  async getStatus(
    @Query('variantId') variantId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    if (!variantId || typeof variantId !== 'string' || !variantId.trim()) {
      throw new BadRequestException('Query parameter variantId is required');
    }
    const wh = (warehouseId && warehouseId.trim()) ? warehouseId.trim() : DEFAULT_WAREHOUSE_ID;
    const status = await this.inventoryService.getInventoryStatus(variantId.trim(), wh);
    return { success: true, data: status };
  }

  @Post('adjust')
  @RequirePermissions('inventory.manage')
  @HttpCode(HttpStatus.OK)
  async adjustStock(@Body() adjustStockDto: AdjustStockDto) {
    const inventoryItem = await this.inventoryService.adjustStock(adjustStockDto);
    return {
      success: true,
      data: {
        inventoryItemId: inventoryItem.id,
        variantId: adjustStockDto.variantId,
        warehouseId: inventoryItem.warehouseId,
        previousQuantity: inventoryItem.quantity - adjustStockDto.quantity,
        newQuantity: inventoryItem.quantity,
        availableQuantity: inventoryItem.availableQuantity,
        reservedQuantity: inventoryItem.reservedQuantity,
      },
    };
  }
}


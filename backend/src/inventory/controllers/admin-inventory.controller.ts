import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus, BadRequestException, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { InventoryService } from '../services/inventory.service';
import { AdjustStockDto, DEFAULT_WAREHOUSE_ID } from '../dto/adjust-stock.dto';
import { BulkAdjustStockDto } from '../dto/bulk-adjust-stock.dto';
import { SetProductInventoryDto } from '../dto/set-product-inventory.dto';
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

  @Get('product-matrix')
  @RequirePermissions('inventory.read')
  @HttpCode(HttpStatus.OK)
  async getProductMatrix(
    @Query('productId') productId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      throw new BadRequestException('Query parameter productId is required');
    }
    const wh = (warehouseId && warehouseId.trim()) ? warehouseId.trim() : DEFAULT_WAREHOUSE_ID;
    const matrix = await this.inventoryService.getProductInventoryMatrix(productId.trim(), wh);
    return { success: true, data: matrix };
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

  @Post('set-product-quantities')
  @RequirePermissions('inventory.manage')
  @HttpCode(HttpStatus.OK)
  async setProductQuantities(
    @Query('productId') productId: string,
    @Body() dto: SetProductInventoryDto,
  ) {
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      throw new BadRequestException('Query parameter productId is required');
    }
    const wh = (dto.warehouseId && dto.warehouseId.trim())
      ? dto.warehouseId.trim()
      : DEFAULT_WAREHOUSE_ID;
    const result = await this.inventoryService.setProductInventoryQuantities(
      productId.trim(),
      wh,
      dto.items,
    );
    return { success: true, data: result };
  }

  @Post('bulk-adjust')
  @RequirePermissions('inventory.manage')
  @HttpCode(HttpStatus.OK)
  async bulkAdjustStock(@Body() dto: BulkAdjustStockDto) {
    const wh = (dto.warehouseId && dto.warehouseId.trim())
      ? dto.warehouseId.trim()
      : DEFAULT_WAREHOUSE_ID;
    const result = await this.inventoryService.bulkAdjustStock(
      dto.items,
      wh,
      dto.defaultReason,
    );
    return { success: true, data: result };
  }

  @Post('bulk-import')
  @RequirePermissions('inventory.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const name = (file.originalname || '').toLowerCase();
        const mime = (file.mimetype || '').toLowerCase();
        const allowed =
          name.endsWith('.csv') ||
          name.endsWith('.xlsx') ||
          name.endsWith('.xls') ||
          mime.includes('csv') ||
          mime.includes('spreadsheet') ||
          mime.includes('excel');
        if (allowed) {
          cb(null, true);
          return;
        }
        cb(
          new BadRequestException('Only .csv and .xlsx files are supported') as any,
          false,
        );
      },
    }),
  )
  @HttpCode(HttpStatus.OK)
  async bulkImportStock(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype?: string } | undefined,
    @Query('warehouseId') warehouseId?: string,
    @Query('defaultReason') defaultReason?: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('A .csv or .xlsx file is required');
    }
    const wh = (warehouseId && warehouseId.trim()) ? warehouseId.trim() : DEFAULT_WAREHOUSE_ID;
    const result = await this.inventoryService.bulkImportStock(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      },
      wh,
      defaultReason?.trim() || undefined,
    );
    return { success: true, data: result };
  }
}


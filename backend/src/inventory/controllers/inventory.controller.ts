import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from '../services/reservation.service';
import { InventoryService } from '../services/inventory.service';
import { ReserveStockDto } from '../dto/reserve-stock.dto';
import { ReleaseStockDto } from '../dto/release-stock.dto';
import { ConsumeStockDto } from '../dto/consume-stock.dto';
import { DEFAULT_WAREHOUSE_ID } from '../dto/adjust-stock.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Post('reserve')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('inventory.manage')
  async reserveStock(@Body() reserveStockDto: ReserveStockDto) {
    const result = await this.reservationService.reserveStock(reserveStockDto);

    return {
      success: true,
      data: {
        reservationId: result.reservation.id,
        variantId: reserveStockDto.variantId,
        quantity: reserveStockDto.quantity,
        referenceType: reserveStockDto.referenceType,
        referenceId: reserveStockDto.referenceId,
        expiresAt: result.reservation.expiresAt,
        availableQuantity: result.inventoryItem.availableQuantity,
      },
    };
  }

  @Post('release')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('inventory.manage')
  async releaseStock(@Body() releaseStockDto: ReleaseStockDto) {
    const result = await this.reservationService.releaseStock(releaseStockDto);

    return {
      success: true,
      data: result,
    };
  }

  @Post('consume')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('inventory.manage')
  async consumeStock(@Body() consumeStockDto: ConsumeStockDto) {
    const result = await this.reservationService.consumeStock(consumeStockDto);

    return {
      success: true,
      data: result,
    };
  }

  @Get('availability')
  @HttpCode(HttpStatus.OK)
  async getAvailability(@Query('variantIds') variantIdsParam: string) {
    const variantIds = (variantIdsParam ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    if (variantIds.length === 0) {
      return { data: {} };
    }
    const warehouseId = DEFAULT_WAREHOUSE_ID;
    const data: Record<string, number> = {};
    await Promise.all(
      variantIds.map(async (variantId) => {
        try {
          const qty = await this.inventoryService.getAvailableQuantity(
            variantId,
            warehouseId,
          );
          data[variantId] = qty;
        } catch {
          data[variantId] = 0;
        }
      }),
    );
    return { data };
  }
}

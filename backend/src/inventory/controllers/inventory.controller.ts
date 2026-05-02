import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ReservationService } from '../services/reservation.service';
import { InventoryService } from '../services/inventory.service';
import { ReserveStockDto } from '../dto/reserve-stock.dto';
import { ReleaseStockDto } from '../dto/release-stock.dto';
import { ConsumeStockDto } from '../dto/consume-stock.dto';
import { DEFAULT_WAREHOUSE_ID } from '../dto/adjust-stock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Post('reserve')
  @HttpCode(HttpStatus.CREATED)
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
  async releaseStock(@Body() releaseStockDto: ReleaseStockDto) {
    const result = await this.reservationService.releaseStock(releaseStockDto);

    return {
      success: true,
      data: result,
    };
  }

  @Post('consume')
  @HttpCode(HttpStatus.OK)
  async consumeStock(@Body() consumeStockDto: ConsumeStockDto) {
    const result = await this.reservationService.consumeStock(consumeStockDto);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get available quantity per variant (for product cards / PDP).
   * Query: variantIds comma-separated (e.g. ?variantIds=id1,id2).
   * For simple products use the product id as variantId.
   */
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
          const qty = await this.inventoryService.getAvailableQuantity(variantId, warehouseId);
          data[variantId] = qty;
        } catch {
          data[variantId] = 0;
        }
      }),
    );
    return { data };
  }
}


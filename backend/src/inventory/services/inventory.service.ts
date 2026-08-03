import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { AdjustStockDto, DEFAULT_WAREHOUSE_ID } from '../dto/adjust-stock.dto';
import { BulkAdjustStockItemDto } from '../dto/bulk-adjust-stock.dto';
import { StockAdjustedEvent } from '../events/inventory.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SetProductInventoryItemDto } from '../dto/set-product-inventory.dto';
import { parseInventoryImportFile } from '../utils/inventory-import.parser';
import {
  effectiveAvailableStock,
  hasEnoughStock,
  toStockQty,
} from '../utils/inventory-stock';
import { CartRedisService } from '../../cart/services/cart.redis';

type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly moduleRef: ModuleRef,
  ) {}

  private async cartStillExists(cartId: string): Promise<boolean> {
    try {
      const cartRedis = this.moduleRef.get(CartRedisService, { strict: false });
      if (!cartRedis?.getCart) return true;
      const cart = await cartRedis.getCart(cartId);
      return cart != null;
    } catch {
      // Cart store unavailable — do not release reservations aggressively
      return true;
    }
  }

  /**
   * Drop expired (and orphaned cart) reservations, then rebuild reserved/available
   * from remaining active rows. Fixes stock locks when Redis carts expire silently.
   */
  async reconcileReservationsForItem(inventoryItemId: string): Promise<void> {
    const now = new Date();

    const candidates = await this.prisma.inventoryReservation.findMany({
      where: { inventoryItemId },
      select: {
        id: true,
        referenceType: true,
        referenceId: true,
        expiresAt: true,
      },
    });

    const toDeleteIds: string[] = [];
    for (const row of candidates) {
      if (row.expiresAt < now) {
        toDeleteIds.push(row.id);
        continue;
      }
      if (row.referenceType === 'cart') {
        const exists = await this.cartStillExists(row.referenceId);
        if (!exists) toDeleteIds.push(row.id);
      }
    }

    if (toDeleteIds.length > 0) {
      await this.prisma.inventoryReservation.deleteMany({
        where: { id: { in: toDeleteIds } },
      });
      this.logger.log(
        `Reconciled inventory ${inventoryItemId}: released ${toDeleteIds.length} stale reservation(s)`,
      );
    }

    const active = await this.prisma.inventoryReservation.aggregate({
      where: { inventoryItemId },
      _sum: { quantity: true },
    });
    const reserved = toStockQty(active._sum.quantity);

    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });
    if (!item) return;

    const onHand = toStockQty(item.quantity);
    const available = Math.max(0, onHand - reserved);

    if (
      toStockQty(item.reservedQuantity) !== reserved ||
      toStockQty(item.availableQuantity) !== available
    ) {
      await this.prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          reservedQuantity: reserved,
          availableQuantity: available,
        },
      });
    }
  }

  async reconcileReservationsForVariant(
    variantId: string,
    warehouseId: string,
  ): Promise<void> {
    const inventoryItem = await this.getOrCreateInventoryItem(
      variantId,
      warehouseId,
    );
    await this.reconcileReservationsForItem(inventoryItem.id);
  }

  /**
   * Resolve variant or simple product. For simple products, variantId === productId and there is no product_variants row.
   */
  private async resolveVariantOrSimpleProduct(
    variantId: string,
    tx: TransactionClient | PrismaService = this.prisma,
  ): Promise<{
    productId: string;
    variantId: string | null;
    isSimple: boolean;
  }> {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (variant) {
      return {
        productId: variant.productId,
        variantId: variant.id,
        isSimple: false,
      };
    }

    const product = await tx.product.findFirst({
      where: { id: variantId, deletedAt: null },
    });

    // Treat as simple when type is 'simple' or missing (no variants = sellable as product itself)
    if (product && (product.type === 'simple' || product.type == null)) {
      return {
        productId: product.id,
        variantId: null,
        isSimple: true,
      };
    }

    throw new NotFoundException(
      `Product variant with ID ${variantId} not found`,
    );
  }

  private async getOrCreateInventoryItemInTx(
    tx: TransactionClient,
    variantId: string,
    warehouseId: string,
  ) {
    const { productId, variantId: resolvedVariantId } =
      await this.resolveVariantOrSimpleProduct(variantId, tx);

    const composite = {
      productId,
      variantId: resolvedVariantId,
      warehouseId,
    };

    let inventoryItem = await tx.inventoryItem.findFirst({
      where: composite,
    });

    if (!inventoryItem) {
      inventoryItem = await tx.inventoryItem.create({
        data: {
          ...composite,
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          lowStockThreshold: 10,
        },
      });
    }

    return inventoryItem;
  }

  /**
   * Get or create inventory item for a variant (or simple product when variantId is productId).
   */
  async getOrCreateInventoryItem(variantId: string, warehouseId: string) {
    const { productId, variantId: resolvedVariantId } =
      await this.resolveVariantOrSimpleProduct(variantId);

    const composite = {
      productId,
      variantId: resolvedVariantId,
      warehouseId,
    };

    let inventoryItem = await this.prisma.inventoryItem.findFirst({
      where: composite,
    });

    if (!inventoryItem) {
      inventoryItem = await this.prisma.inventoryItem.create({
        data: {
          ...composite,
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          lowStockThreshold: 10,
        },
      });
    }

    return inventoryItem;
  }

  /**
   * Get inventory item by variant and warehouse (supports simple products when variantId === productId).
   */
  async getInventoryItem(variantId: string, warehouseId: string) {
    const { productId, variantId: resolvedVariantId } =
      await this.resolveVariantOrSimpleProduct(variantId);

    let inventoryItem = await this.prisma.inventoryItem.findFirst({
      where: {
        productId,
        variantId: resolvedVariantId,
        warehouseId,
      },
    });

    if (!inventoryItem) {
      inventoryItem = await this.getOrCreateInventoryItem(
        variantId,
        warehouseId,
      );
    }

    return inventoryItem;
  }

  /**
   * Get available quantity for a variant (configurable or simple). Inventory is enforced for both.
   * Reconciles stale reservations first so abandoned carts do not permanently lock stock.
   */
  async getAvailableQuantity(
    variantId: string,
    warehouseId: string,
  ): Promise<number> {
    await this.reconcileReservationsForVariant(variantId, warehouseId);
    const inventoryItem = await this.getInventoryItem(variantId, warehouseId);
    return toStockQty(inventoryItem.availableQuantity);
  }

  /**
   * On-hand quantity (ignores reservations).
   */
  async getOnHandQuantity(
    variantId: string,
    warehouseId: string,
  ): Promise<number> {
    const inventoryItem = await this.getInventoryItem(variantId, warehouseId);
    return toStockQty(inventoryItem.quantity);
  }

  /**
   * Sellable units for this caller: free available + optional credit for their own
   * reservation that will be replaced in the same request.
   */
  async getEffectiveAvailableQuantity(
    variantId: string,
    warehouseId: string,
    creditOwnReservedQuantity = 0,
  ): Promise<number> {
    const available = await this.getAvailableQuantity(variantId, warehouseId);
    return effectiveAvailableStock(available, creditOwnReservedQuantity);
  }

  /**
   * Check if variant has sufficient stock for the requested quantity.
   * Pass `creditOwnReservedQuantity` when replacing an existing cart/order reservation
   * so that reservation is not double-counted against availability.
   */
  async hasSufficientStock(
    variantId: string,
    quantity: number,
    warehouseId: string,
    creditOwnReservedQuantity = 0,
  ): Promise<boolean> {
    const available = await this.getAvailableQuantity(variantId, warehouseId);
    return hasEnoughStock(available, quantity, creditOwnReservedQuantity);
  }

  /**
   * Adjust stock quantity (increase or decrease)
   * Prevents negative stock unless explicitly allowed
   */
  async adjustStock(adjustStockDto: AdjustStockDto) {
    const warehouseId = adjustStockDto.warehouseId ?? DEFAULT_WAREHOUSE_ID;
    const { variantId, quantity, reason } = adjustStockDto;

    return await this.prisma.$transaction(async (tx) => {
      const inventoryItem = await this.getOrCreateInventoryItem(
        variantId,
        warehouseId,
      );

      const previousQuantity = inventoryItem.quantity;
      const newQuantity = previousQuantity + quantity;

      // Prevent negative stock
      if (newQuantity < 0) {
        throw new BadRequestException(
          `Cannot adjust stock to negative value. Current: ${previousQuantity}, Adjustment: ${quantity}`,
        );
      }

      const updatedItem = await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: newQuantity,
          availableQuantity: newQuantity - inventoryItem.reservedQuantity,
        },
      });

      // Emit event
      this.eventEmitter.emit(
        'stock.adjusted',
        new StockAdjustedEvent(
          updatedItem.id,
          variantId,
          previousQuantity,
          newQuantity,
          reason,
        ),
      );

      return updatedItem;
    });
  }

  /**
   * Update available quantity (internal method)
   * This should be called after reserved quantity changes
   */
  async updateAvailableQuantity(inventoryItemId: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!item) {
      throw new NotFoundException(
        `Inventory item ${inventoryItemId} not found`,
      );
    }

    return await this.prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: {
        availableQuantity: item.quantity - item.reservedQuantity,
      },
    });
  }

  /**
   * Get inventory status for a variant
   */
  async getInventoryStatus(variantId: string, warehouseId: string) {
    const inventoryItem = await this.getInventoryItem(variantId, warehouseId);
    const isLowStock =
      inventoryItem.availableQuantity <= inventoryItem.lowStockThreshold;

    return {
      variantId,
      warehouseId,
      quantity: inventoryItem.quantity,
      reservedQuantity: inventoryItem.reservedQuantity,
      availableQuantity: inventoryItem.availableQuantity,
      lowStockThreshold: inventoryItem.lowStockThreshold,
      isLowStock,
      isInStock: inventoryItem.availableQuantity > 0,
    };
  }

  /**
   * Product-level inventory matrix:
   * - configurable product: one row per variant
   * - simple product: one row for product itself (targetId = productId)
   */
  async getProductInventoryMatrix(productId: string, warehouseId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: {
        variants: {
          orderBy: { position: 'asc' },
          select: { id: true, sku: true, name: true, isActive: true },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const targets =
      product.variants.length > 0
        ? product.variants.map((v) => ({
            targetId: v.id,
            type: 'variant' as const,
            sku: v.sku,
            name: v.name,
            isActive: v.isActive,
          }))
        : [
            {
              targetId: product.id,
              type: 'product' as const,
              sku: product.sku,
              name: product.name,
              isActive: true,
            },
          ];

    const rows = await Promise.all(
      targets.map(async (t) => {
        const status = await this.getInventoryStatus(t.targetId, warehouseId);
        return {
          ...t,
          quantity: status.quantity,
          reservedQuantity: status.reservedQuantity,
          availableQuantity: status.availableQuantity,
          lowStockThreshold: status.lowStockThreshold,
        };
      }),
    );

    return {
      productId: product.id,
      productName: product.name,
      productType: product.type,
      warehouseId,
      rows,
    };
  }

  async setProductInventoryQuantities(
    productId: string,
    warehouseId: string,
    items: SetProductInventoryItemDto[],
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const results: Array<{
        targetId: string;
        previousQuantity: number;
        newQuantity: number;
        availableQuantity: number;
        reservedQuantity: number;
      }> = [];

      for (const item of items) {
        const resolved = await this.resolveVariantOrSimpleProduct(
          item.targetId,
        );
        if (resolved.productId !== productId) {
          throw new BadRequestException(
            `Target ${item.targetId} does not belong to product ${productId}`,
          );
        }

        let inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            productId: resolved.productId,
            variantId: resolved.variantId,
            warehouseId,
          },
        });

        if (!inventoryItem) {
          inventoryItem = await tx.inventoryItem.create({
            data: {
              productId: resolved.productId,
              variantId: resolved.variantId,
              warehouseId,
              quantity: 0,
              reservedQuantity: 0,
              availableQuantity: 0,
              lowStockThreshold: 10,
            },
          });
        }

        const updated = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: item.quantity,
            availableQuantity: item.quantity - inventoryItem.reservedQuantity,
          },
        });

        results.push({
          targetId: item.targetId,
          previousQuantity: inventoryItem.quantity,
          newQuantity: updated.quantity,
          availableQuantity: updated.availableQuantity,
          reservedQuantity: updated.reservedQuantity,
        });
      }

      return {
        productId,
        warehouseId,
        updated: results,
      };
    });
  }

  /**
   * Apply signed quantity deltas to multiple variants in a single transaction.
   */
  async bulkAdjustStock(
    items: BulkAdjustStockItemDto[],
    warehouseId: string = DEFAULT_WAREHOUSE_ID,
    defaultReason?: string,
  ) {
    if (!items.length) {
      throw new BadRequestException('At least one adjustment is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated: Array<{
        variantId: string;
        previousQuantity: number;
        newQuantity: number;
        availableQuantity: number;
        reservedQuantity: number;
        reason?: string;
      }> = [];

      for (const item of items) {
        const inventoryItem = await this.getOrCreateInventoryItemInTx(
          tx,
          item.variantId,
          warehouseId,
        );

        const previousQuantity = inventoryItem.quantity;
        const newQuantity = previousQuantity + item.quantity;

        if (newQuantity < 0) {
          throw new BadRequestException(
            `Cannot adjust stock to negative value for ${item.variantId}. Current: ${previousQuantity}, Adjustment: ${item.quantity}`,
          );
        }

        const updatedItem = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQuantity,
            availableQuantity: newQuantity - inventoryItem.reservedQuantity,
          },
        });

        const reason =
          item.reason?.trim() || defaultReason?.trim() || undefined;

        this.eventEmitter.emit(
          'stock.adjusted',
          new StockAdjustedEvent(
            updatedItem.id,
            item.variantId,
            previousQuantity,
            newQuantity,
            reason,
          ),
        );

        updated.push({
          variantId: item.variantId,
          previousQuantity,
          newQuantity: updatedItem.quantity,
          availableQuantity: updatedItem.availableQuantity,
          reservedQuantity: updatedItem.reservedQuantity,
          reason,
        });
      }

      return { warehouseId, updated };
    });
  }

  /**
   * Parse a CSV/XLSX upload and apply stock deltas in one transaction.
   */
  async bulkImportStock(
    file: { buffer: Buffer; originalname: string; mimetype?: string },
    warehouseId: string = DEFAULT_WAREHOUSE_ID,
    defaultReason?: string,
  ) {
    const rows = parseInventoryImportFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
    const items: BulkAdjustStockItemDto[] = rows.map((row) => ({
      variantId: row.variantId,
      quantity: row.quantityDelta,
      reason: row.reason,
    }));

    const result = await this.bulkAdjustStock(
      items,
      warehouseId,
      defaultReason,
    );

    return {
      ...result,
      importedRows: rows.length,
    };
  }
}

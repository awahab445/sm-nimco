import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { InventoryService } from './inventory.service';
import { ReserveStockDto } from '../dto/reserve-stock.dto';
import { ReleaseStockDto } from '../dto/release-stock.dto';
import { ConsumeStockDto } from '../dto/consume-stock.dto';
import {
  StockReservedEvent,
  StockReleasedEvent,
  StockConsumedEvent,
} from '../events/inventory.events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ReservationService {
  private readonly DEFAULT_RESERVATION_EXPIRY_MINUTES = 15;

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Reserve stock for a cart or order
   * Uses transaction to prevent race conditions
   */
  async reserveStock(reserveStockDto: ReserveStockDto) {
    const {
      variantId,
      quantity,
      referenceType,
      referenceId,
      expiresInMinutes = this.DEFAULT_RESERVATION_EXPIRY_MINUTES,
    } = reserveStockDto;

    // Default warehouse - in production, this should come from config or request context
    const warehouseId = 'default-warehouse';

    return await this.prisma.$transaction(async (tx) => {
      // Check if sufficient stock is available
      const hasStock = await this.inventoryService.hasSufficientStock(
        variantId,
        quantity,
        warehouseId,
      );

      if (!hasStock) {
        const available = await this.inventoryService.getAvailableQuantity(
          variantId,
          warehouseId,
        );
        throw new ConflictException(
          `Insufficient stock. Requested: ${quantity}, Available: ${available}`,
        );
      }

      // Get or create inventory item
      const inventoryItem =
        await this.inventoryService.getOrCreateInventoryItem(
          variantId,
          warehouseId,
        );

      // Check again within transaction (double-check locking)
      const currentItem = await tx.inventoryItem.findUnique({
        where: { id: inventoryItem.id },
      });

      if (!currentItem) {
        throw new NotFoundException('Inventory item not found');
      }

      const availableQuantity =
        currentItem.quantity - currentItem.reservedQuantity;

      if (availableQuantity < quantity) {
        throw new ConflictException(
          `Insufficient stock. Requested: ${quantity}, Available: ${availableQuantity}`,
        );
      }

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

      // Create reservation
      const reservation = await tx.inventoryReservation.create({
        data: {
          inventoryItemId: inventoryItem.id,
          referenceType,
          referenceId,
          quantity,
          expiresAt,
        },
      });

      // Update reserved quantity and available quantity
      const updatedItem = await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          reservedQuantity: currentItem.reservedQuantity + quantity,
          availableQuantity:
            currentItem.quantity - (currentItem.reservedQuantity + quantity),
        },
      });

      // Emit event
      this.eventEmitter.emit(
        'stock.reserved',
        new StockReservedEvent(
          reservation.id,
          variantId,
          quantity,
          referenceType,
          referenceId,
        ),
      );

      return {
        reservation,
        inventoryItem: updatedItem,
      };
    });
  }

  /**
   * Release stock reservation
   */
  async releaseStock(releaseStockDto: ReleaseStockDto) {
    const { reservationId, referenceType, referenceId } = releaseStockDto;

    return await this.prisma.$transaction(async (tx) => {
      let reservation;

      if (reservationId) {
        reservation = await tx.inventoryReservation.findUnique({
          where: { id: reservationId },
          include: { inventoryItem: true },
        });
      } else if (referenceType && referenceId) {
        reservation = await tx.inventoryReservation.findFirst({
          where: {
            referenceType,
            referenceId,
          },
          include: { inventoryItem: true },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        throw new BadRequestException(
          'Either reservationId or (referenceType and referenceId) must be provided',
        );
      }

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      if (!reservation.inventoryItem) {
        throw new NotFoundException('Inventory item not found for reservation');
      }

      const inventoryItem = reservation.inventoryItem;

      // Update reserved quantity
      const newReservedQuantity = Math.max(
        0,
        inventoryItem.reservedQuantity - reservation.quantity,
      );

      await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          reservedQuantity: newReservedQuantity,
          availableQuantity: inventoryItem.quantity - newReservedQuantity,
        },
      });

      // Delete reservation
      await tx.inventoryReservation.delete({
        where: { id: reservation.id },
      });

      // Emit event
      this.eventEmitter.emit(
        'stock.released',
        new StockReleasedEvent(
          reservation.id,
          inventoryItem.variantId || '',
          reservation.quantity,
          reservation.referenceType,
          reservation.referenceId,
        ),
      );

      return {
        released: true,
        reservationId: reservation.id,
        quantity: reservation.quantity,
      };
    });
  }

  /**
   * Consume stock (convert reservation to final stock reduction)
   * Called when order is placed
   */
  async consumeStock(consumeStockDto: ConsumeStockDto) {
    const { reservationId } = consumeStockDto;

    return await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findUnique({
        where: { id: reservationId },
        include: { inventoryItem: true },
      });

      if (!reservation) {
        throw new NotFoundException(`Reservation ${reservationId} not found`);
      }

      if (reservation.expiresAt < new Date()) {
        throw new BadRequestException(
          `Reservation ${reservationId} has expired`,
        );
      }

      const inventoryItem = reservation.inventoryItem;

      // Reduce quantity and reserved quantity
      const newQuantity = inventoryItem.quantity - reservation.quantity;
      const newReservedQuantity =
        inventoryItem.reservedQuantity - reservation.quantity;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Cannot consume stock. Would result in negative quantity: ${newQuantity}`,
        );
      }

      // Update inventory
      const updatedItem = await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: newQuantity,
          reservedQuantity: newReservedQuantity,
          availableQuantity: newQuantity - newReservedQuantity,
        },
      });

      // Delete reservation
      await tx.inventoryReservation.delete({
        where: { id: reservationId },
      });

      // Emit event
      this.eventEmitter.emit(
        'stock.consumed',
        new StockConsumedEvent(
          reservation.id,
          inventoryItem.variantId || '',
          reservation.quantity,
          reservation.referenceType,
          reservation.referenceId,
        ),
      );

      return {
        consumed: true,
        reservationId: reservation.id,
        quantity: reservation.quantity,
        inventoryItem: updatedItem,
      };
    });
  }

  /**
   * Release all reservations for a reference (e.g., cart)
   */
  async releaseReservationsByReference(
    referenceType: string,
    referenceId: string,
  ) {
    const reservations = await this.prisma.inventoryReservation.findMany({
      where: {
        referenceType,
        referenceId,
      },
      include: { inventoryItem: true },
    });

    const results = await Promise.all(
      reservations.map((reservation) =>
        this.releaseStock({
          reservationId: reservation.id,
        }),
      ),
    );

    return {
      released: results.length,
      reservations: results,
    };
  }

  /**
   * Clean up expired reservations
   * Should be called by a scheduled job
   */
  async cleanupExpiredReservations() {
    const now = new Date();

    const expiredReservations = await this.prisma.inventoryReservation.findMany(
      {
        where: {
          expiresAt: {
            lt: now,
          },
        },
        include: { inventoryItem: true },
      },
    );

    const results = await Promise.all(
      expiredReservations.map((reservation) =>
        this.releaseStock({
          reservationId: reservation.id,
        }),
      ),
    );

    return {
      cleaned: results.length,
      reservations: results,
    };
  }
}

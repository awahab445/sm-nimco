import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ReservationService } from '../services/reservation.service';
import { CartExpiredEvent, OrderCreatedEvent } from './inventory.events';

@Injectable()
export class InventoryEventHandlers {
  constructor(private readonly reservationService: ReservationService) {}

  @OnEvent('cart.expired')
  async handleCartExpired(event: CartExpiredEvent) {
    // Release all reservations for the expired cart
    await this.reservationService.releaseReservationsByReference('cart', event.cartId);
  }

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    // Consume stock for each item in the order
    for (const item of event.items) {
      if (item.reservationId) {
        // If reservation exists, consume it
        try {
          await this.reservationService.consumeStock({
            reservationId: item.reservationId,
          });
        } catch (error) {
          // Log error but don't fail the order creation
          // In production, you might want to handle this differently
          console.error(`Failed to consume stock for reservation ${item.reservationId}:`, error);
        }
      } else {
        // If no reservation, create one and immediately consume it
        // This handles cases where orders are created without cart reservations
        try {
          const reserveResult = await this.reservationService.reserveStock({
            variantId: item.variantId,
            quantity: item.quantity,
            referenceType: 'order',
            referenceId: event.orderId,
            expiresInMinutes: 1, // Very short expiry since we'll consume immediately
          });

          await this.reservationService.consumeStock({
            reservationId: reserveResult.reservation.id,
          });
        } catch (error) {
          console.error(
            `Failed to reserve and consume stock for variant ${item.variantId}:`,
            error,
          );
          throw error; // Re-throw for order creation to handle
        }
      }
    }
  }
}


import { Injectable } from '@nestjs/common';

/**
 * Cart Event Handlers
 *
 * Note: Cart expiration is handled by InventoryEventHandlers
 * which listens to 'cart.expired' events and releases reservations.
 *
 * This class is kept for future cart-specific event handling needs.
 */
@Injectable()
export class CartEventHandlers {
  // Future cart-specific event handlers can be added here
}

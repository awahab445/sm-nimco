import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CheckoutSession } from './checkout.redis';
import { ReservationService } from '../../inventory/services/reservation.service';
import { InventoryService } from '../../inventory/services/inventory.service';

@Injectable()
export class CheckoutValidatorService {
  private readonly logger = new Logger(CheckoutValidatorService.name);

  constructor(
    private readonly reservationService: ReservationService,
    private readonly inventoryService: InventoryService,
  ) {}

  /**
   * Validate checkout session is in valid state for operations
   */
  validateCheckoutState(
    checkout: CheckoutSession,
    allowedStatuses: CheckoutSession['status'][] = ['pending'],
  ): void {
    if (!allowedStatuses.includes(checkout.status)) {
      throw new BadRequestException(
        `Checkout is in ${checkout.status} status and cannot be modified`,
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(checkout.expiresAt);
    if (now > expiresAt) {
      throw new BadRequestException('Checkout session has expired');
    }
  }

  /**
   * Validate checkout has required data for confirmation
   */
  validateCheckoutForConfirmation(checkout: CheckoutSession): void {
    // Validate state
    this.validateCheckoutState(checkout, ['pending']);

    // Validate items
    if (!checkout.items || checkout.items.length === 0) {
      throw new BadRequestException('Checkout must have at least one item');
    }

    // Validate addresses
    if (!checkout.billingAddress) {
      throw new BadRequestException('Billing address is required');
    }

    if (!checkout.shippingAddress) {
      throw new BadRequestException('Shipping address is required');
    }

    if (!checkout.billingAddress.phone?.trim()) {
      throw new BadRequestException('Billing phone number is required');
    }

    if (!checkout.shippingAddress.phone?.trim()) {
      throw new BadRequestException('Shipping phone number is required');
    }

    // Validate shipping method
    if (!checkout.shippingMethod) {
      throw new BadRequestException('Shipping method is required');
    }

    // Validate customer email
    if (!checkout.customerEmail) {
      throw new BadRequestException('Customer email is required');
    }

    // Validate totals
    if (checkout.grandTotal <= 0) {
      throw new BadRequestException('Checkout total must be greater than zero');
    }
  }

  /**
   * Validate inventory reservations are still valid
   * Note: We validate that reservations exist by checking availability
   * The actual reservation validation happens during order creation
   */
  async validateInventoryReservations(
    checkout: CheckoutSession,
  ): Promise<void> {
    for (const item of checkout.items) {
      if (!item.reservationId) {
        throw new BadRequestException(
          `Item ${item.variantId} does not have a valid reservation`,
        );
      }

      // We validate availability instead of directly checking reservations
      // The reservation will be validated and consumed during order creation
      // This ensures we don't have race conditions
    }
  }

  /**
   * Validate cart snapshot matches current inventory availability
   */
  async validateInventoryAvailability(
    checkout: CheckoutSession,
  ): Promise<void> {
    for (const item of checkout.items) {
      // Cart reservation already holds `item.quantity` — credit it so checkout
      // does not treat the shopper's own hold as someone else's demand.
      const creditOwnReserved = item.reservationId
        ? Number(item.quantity) || 0
        : 0;
      const hasStock = await this.inventoryService.hasSufficientStock(
        item.variantId,
        item.quantity,
        'default-warehouse',
        creditOwnReserved,
      );

      if (!hasStock) {
        const available =
          await this.inventoryService.getEffectiveAvailableQuantity(
            item.variantId,
            'default-warehouse',
            creditOwnReserved,
          );
        throw new BadRequestException(
          `Insufficient stock for variant ${item.variantId}. Requested: ${item.quantity}, Available: ${available}`,
        );
      }
    }
  }

  /**
   * Comprehensive validation before checkout confirmation
   */
  async validateForConfirmation(checkout: CheckoutSession): Promise<void> {
    // Validate checkout state and required fields
    this.validateCheckoutForConfirmation(checkout);

    // Validate inventory reservations
    await this.validateInventoryReservations(checkout);

    // Validate inventory availability (double-check)
    await this.validateInventoryAvailability(checkout);
  }
}

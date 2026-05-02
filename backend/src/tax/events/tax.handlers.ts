import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TaxCalculatedEvent, TaxUpdatedEvent } from './tax.events';

@Injectable()
export class TaxEventHandlers {
  private readonly logger = new Logger(TaxEventHandlers.name);

  /**
   * Handle tax calculated event
   */
  @OnEvent('tax.calculated')
  async handleTaxCalculated(event: TaxCalculatedEvent) {
    const { context, calculation } = event;
    const contextStr = [
      context.cartId && `cart ${context.cartId}`,
      context.checkoutId && `checkout ${context.checkoutId}`,
      context.orderId && `order ${context.orderId}`,
    ]
      .filter(Boolean)
      .join(', ');

    this.logger.log(
      `Tax calculated for ${contextStr}: ${calculation.taxTotal.toFixed(2)} (${calculation.taxes.length} tax(es) applied)`,
    );
    // Additional processing can be added here (e.g., analytics, audit logs)
  }

  /**
   * Handle tax updated event
   */
  @OnEvent('tax.updated')
  async handleTaxUpdated(event: TaxUpdatedEvent) {
    this.logger.log(
      `Tax updated: ${event.taxId} (TaxClass: ${event.taxClassId}) - Changes: ${JSON.stringify(event.changes)}`,
    );
    // Additional processing can be added here (e.g., invalidate cache, notify affected orders)
  }
}


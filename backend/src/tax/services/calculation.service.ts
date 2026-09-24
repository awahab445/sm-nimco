import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../catalog/services/prisma.service';
import {
  TaxCalculationItem,
  TaxCalculationContext,
  TaxCalculationResult,
} from '../dto/calculate-tax.dto';
import { TaxCalculatedEvent } from '../events/tax.events';

@Injectable()
export class TaxCalculationService {
  private readonly logger = new Logger(TaxCalculationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Calculate taxes for cart/checkout/order items.
   * Automatic tax is disabled — always returns zero tax totals.
   */
  calculate(
    items: TaxCalculationItem[],
    context: TaxCalculationContext,
    emitEvent = true,
  ): Promise<TaxCalculationResult> {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const result: TaxCalculationResult = {
      items: items.map((item) => ({
        ...item,
        taxableAmount: item.price * item.quantity,
        taxAmount: 0,
        appliedTaxes: [],
      })),
      taxes: [],
      subtotal,
      taxTotal: 0,
      grandTotal: subtotal,
    };

    if (emitEvent && items.length > 0) {
      this.eventEmitter.emit(
        'tax.calculated',
        new TaxCalculatedEvent(
          {
            country: context.country,
            region: context.region,
          },
          result,
        ),
      );
    }

    return Promise.resolve(result);
  }

  /**
   * Calculate taxes for cart items (simplified interface)
   */
  async calculateForCart(
    items: Array<{
      productId: string;
      variantId?: string;
      price: number;
      quantity: number;
    }>,
    country: string,
    region?: string,
  ): Promise<{
    taxTotal: number;
    itemTaxes: Array<{
      productId: string;
      variantId?: string;
      taxAmount: number;
    }>;
  }> {
    // Fetch tax class IDs for products
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, taxClassId: true },
    });

    const taxClassMap = new Map<string, string | null>(
      products.map((p) => [p.id, p.taxClassId]),
    );

    // Map items to TaxCalculationItem format
    const taxItems: TaxCalculationItem[] = items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      taxClassId: taxClassMap.get(item.productId) ?? null,
      price: item.price,
      quantity: item.quantity,
    }));

    const result = await this.calculate(
      taxItems,
      { country, region },
      false, // Don't emit event for cart calculations (will emit during checkout)
    );

    return {
      taxTotal: result.taxTotal,
      itemTaxes: result.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        taxAmount: item.taxAmount,
      })),
    };
  }

  /**
   * Calculate and store taxes for an order
   */
  async calculateAndStoreForOrder(
    orderId: string,
    items: TaxCalculationItem[],
    context: TaxCalculationContext,
  ): Promise<{ taxTotal: number; orderTaxIds: string[] }> {
    const calculation = await this.calculate(items, context, true);

    // Store order taxes
    const orderTaxIds: string[] = [];
    for (const tax of calculation.taxes) {
      const taxRecord = await this.prisma.orderTax.create({
        data: {
          orderId,
          taxId: tax.taxId,
          taxClassId: tax.taxClassId,
          taxClassCode: tax.taxClassCode,
          taxClassName: tax.taxClassName,
          country: tax.country,
          region: tax.region,
          rate: tax.rate,
          isInclusive: tax.isInclusive,
          taxableAmount: tax.taxableAmount,
          taxAmount: tax.taxAmount,
          metadata: {},
        },
      });
      orderTaxIds.push(taxRecord.id);
    }

    this.logger.log(
      `Order taxes stored for order ${orderId}: ${orderTaxIds.length} tax record(s)`,
    );
    return {
      taxTotal: calculation.taxTotal,
      orderTaxIds,
    };
  }
}

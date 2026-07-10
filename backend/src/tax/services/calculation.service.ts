import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../catalog/services/prisma.service';
import { TaxService } from './tax.service';
import {
  TaxCalculationItem,
  TaxCalculationContext,
  TaxCalculationResult,
  CalculatedTax,
} from '../dto/calculate-tax.dto';
import { TaxCalculatedEvent } from '../events/tax.events';

@Injectable()
export class TaxCalculationService {
  private readonly logger = new Logger(TaxCalculationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly taxService: TaxService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Calculate taxes for cart/checkout/order items
   */
  async calculate(
    items: TaxCalculationItem[],
    context: TaxCalculationContext,
    emitEvent = true,
  ): Promise<TaxCalculationResult> {
    if (items.length === 0) {
      return {
        items: [],
        taxes: [],
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
      };
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Group items by tax class for calculation
    const itemsByTaxClass = new Map<string | null, TaxCalculationItem[]>();
    for (const item of items) {
      const key = item.taxClassId || 'null';
      if (!itemsByTaxClass.has(key)) {
        itemsByTaxClass.set(key, []);
      }
      itemsByTaxClass.get(key)!.push(item);
    }

    const calculatedItems: TaxCalculationResult['items'] = [];
    const allTaxes = new Map<string, CalculatedTax>(); // Track unique taxes by taxId

    // Process each tax class group
    for (const [taxClassIdStr, classItems] of itemsByTaxClass.entries()) {
      const taxClassId = taxClassIdStr === 'null' ? null : taxClassIdStr;

      // Find applicable taxes for this tax class and location
      const applicableTaxes = await this.taxService.findApplicableTaxes(
        context.country,
        context.region || null,
        taxClassId,
      );

      if (applicableTaxes.length === 0) {
        // No taxes applicable - items are tax-free
        for (const item of classItems) {
          calculatedItems.push({
            ...item,
            taxableAmount: item.price * item.quantity,
            taxAmount: 0,
            appliedTaxes: [],
          });
        }
        continue;
      }

      // Calculate tax for each item in this tax class
      for (const item of classItems) {
        const itemSubtotal = item.price * item.quantity;
        const itemTaxableAmount = itemSubtotal;
        let itemTaxAmount = 0;
        const itemAppliedTaxes: CalculatedTax[] = [];

        // Apply all applicable taxes (support for compound taxes if needed)
        for (const tax of applicableTaxes) {
          const taxClass = await this.taxService.findTaxClassById(
            tax.taxClassId,
          );

          // Calculate taxable amount and tax amount based on inclusive/exclusive
          let taxableAmountForThisTax = itemTaxableAmount;
          let taxAmountForThisTax = 0;

          if (tax.isInclusive) {
            // Tax is included in price: extract tax from price
            // If price = 120 with 20% tax inclusive:
            // taxableAmount = 120 / (1 + 0.20) = 100
            // taxAmount = 120 - 100 = 20
            const rateDecimal = tax.rate / 100;
            taxableAmountForThisTax = itemSubtotal / (1 + rateDecimal);
            taxAmountForThisTax = itemSubtotal - taxableAmountForThisTax;
          } else {
            // Tax is added to price: calculate tax on top
            // If price = 100 with 20% tax exclusive:
            // taxableAmount = 100
            // taxAmount = 100 * 0.20 = 20
            taxableAmountForThisTax = itemSubtotal;
            taxAmountForThisTax = itemSubtotal * (tax.rate / 100);
          }

          // For compound taxes, subsequent taxes apply to the amount including previous taxes
          // But for simplicity, we'll apply all taxes to the base amount
          // In most jurisdictions, only one tax applies per item
          // If multiple taxes apply, we sum them (e.g., state tax + federal tax)

          itemTaxAmount += taxAmountForThisTax;

          const calculatedTax: CalculatedTax = {
            taxId: tax.id,
            taxClassId: tax.taxClassId,
            taxClassCode: taxClass.code,
            taxClassName: taxClass.name,
            country: tax.country,
            region: tax.region,
            rate: tax.rate,
            isInclusive: tax.isInclusive,
            taxableAmount: taxableAmountForThisTax,
            taxAmount: taxAmountForThisTax,
          };

          itemAppliedTaxes.push(calculatedTax);

          // Track this tax globally (aggregate by taxId)
          if (allTaxes.has(tax.id)) {
            const existing = allTaxes.get(tax.id)!;
            existing.taxableAmount += taxableAmountForThisTax;
            existing.taxAmount += taxAmountForThisTax;
          } else {
            allTaxes.set(tax.id, {
              ...calculatedTax,
              taxableAmount: taxableAmountForThisTax,
              taxAmount: taxAmountForThisTax,
            });
          }
        }

        calculatedItems.push({
          ...item,
          taxableAmount: itemTaxableAmount,
          taxAmount: itemTaxAmount,
          appliedTaxes: itemAppliedTaxes,
        });
      }
    }

    // Calculate totals
    const taxTotal = calculatedItems.reduce(
      (sum, item) => sum + item.taxAmount,
      0,
    );
    const grandTotal = subtotal + taxTotal;

    const result: TaxCalculationResult = {
      items: calculatedItems,
      taxes: Array.from(allTaxes.values()),
      subtotal,
      taxTotal,
      grandTotal,
    };

    // Emit event if requested
    if (emitEvent) {
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

    return result;
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

import { BadRequestException, Injectable } from '@nestjs/common';
import { VariantService } from '../../catalog/services/variant.service';
import { BundleDealItemDto } from '../dto/bundle-deal-item.dto';

export type ResolvedBundleItem = {
  productId: string;
  variantId: string;
  quantity: number;
  unitListPrice: number;
  lineListTotal: number;
  productName?: string;
  variantName?: string;
  productImage?: string;
  sku?: string;
};

export type BundlePricingResult = {
  items: ResolvedBundleItem[];
  compareAtTotal: number;
  dealPrice: number;
  savingsAmount: number;
  savingsPercent: number;
  allocations: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    allocatedUnitPrice: number;
  }>;
};

@Injectable()
export class BundleDealPricingService {
  constructor(private readonly variantService: VariantService) {}

  async resolveItems(
    items: BundleDealItemDto[],
  ): Promise<ResolvedBundleItem[]> {
    const resolved: ResolvedBundleItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const variantId = item.variantId ?? item.productId;
      const variant = await this.variantService.findOneOrForSimpleProduct(
        variantId,
        item.productId,
      );

      const unitListPrice = Number(variant.price);
      const lineListTotal = unitListPrice * item.quantity;

      const variantObj = variant as {
        product?: { name?: string };
        name?: string;
        sku?: string;
        images?: { isPrimary?: boolean; url: string }[];
      };

      const imgs = variantObj.images;
      const primaryImage = imgs?.find((img) => img.isPrimary) || imgs?.[0];

      resolved.push({
        productId: item.productId,
        variantId: variant.id,
        quantity: item.quantity,
        unitListPrice,
        lineListTotal,
        productName: variantObj.product?.name ?? variantObj.name,
        variantName: variantObj.name,
        productImage: primaryImage?.url,
        sku: variantObj.sku,
      });
    }

    return resolved;
  }

  async computePricing(
    items: BundleDealItemDto[],
    dealPrice: number,
  ): Promise<BundlePricingResult> {
    if (items.length < 3) {
      throw new BadRequestException(
        'A bundle deal must include at least 3 products',
      );
    }

    if (dealPrice < 0) {
      throw new BadRequestException('Deal price must be non-negative');
    }

    const resolved = await this.resolveItems(items);
    const compareAtTotal = resolved.reduce(
      (sum, r) => sum + r.lineListTotal,
      0,
    );

    if (dealPrice > compareAtTotal) {
      throw new BadRequestException(
        'Deal price cannot exceed the compare-at total of component products',
      );
    }

    const savingsAmount = compareAtTotal - dealPrice;
    const savingsPercent =
      compareAtTotal > 0
        ? Number(((savingsAmount / compareAtTotal) * 100).toFixed(2))
        : 0;

    const allocations = resolved.map((item) => {
      const allocatedLineTotal =
        compareAtTotal > 0
          ? (item.lineListTotal / compareAtTotal) * dealPrice
          : 0;
      const allocatedUnitPrice =
        item.quantity > 0 ? allocatedLineTotal / item.quantity : 0;

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        allocatedUnitPrice: Number(allocatedUnitPrice.toFixed(2)),
      };
    });

    return {
      items: resolved,
      compareAtTotal: Number(compareAtTotal.toFixed(2)),
      dealPrice: Number(dealPrice.toFixed(2)),
      savingsAmount: Number(savingsAmount.toFixed(2)),
      savingsPercent,
      allocations,
    };
  }

  async preview(
    items: BundleDealItemDto[],
    dealPrice?: number,
  ): Promise<
    Omit<BundlePricingResult, 'allocations'> & {
      allocations?: BundlePricingResult['allocations'];
    }
  > {
    const resolved = await this.resolveItems(items);
    const compareAtTotal = resolved.reduce(
      (sum, r) => sum + r.lineListTotal,
      0,
    );
    const effectiveDealPrice = dealPrice ?? compareAtTotal;
    const pricing = await this.computePricing(items, effectiveDealPrice);
    return pricing;
  }
}

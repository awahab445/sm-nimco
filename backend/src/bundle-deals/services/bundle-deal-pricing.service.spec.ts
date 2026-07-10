import { BadRequestException } from '@nestjs/common';
import { BundleDealPricingService } from './bundle-deal-pricing.service';
import { VariantService } from '../../catalog/services/variant.service';

describe('BundleDealPricingService', () => {
  const variantService = {
    findOneOrForSimpleProduct: jest.fn(),
  } as unknown as VariantService;

  const service = new BundleDealPricingService(variantService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects fewer than 3 items', async () => {
    (variantService.findOneOrForSimpleProduct as jest.Mock).mockResolvedValue({
      id: 'v1',
      productId: 'p1',
      price: 100,
      name: 'Item',
    });

    await expect(
      service.computePricing(
        [
          { productId: 'p1', quantity: 1 },
          { productId: 'p2', quantity: 1 },
        ],
        150,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('computes compare-at, savings, and proportional allocation', async () => {
    (variantService.findOneOrForSimpleProduct as jest.Mock)
      .mockResolvedValueOnce({
        id: 'v1',
        productId: 'p1',
        price: 100,
        name: 'A',
      })
      .mockResolvedValueOnce({
        id: 'v2',
        productId: 'p2',
        price: 200,
        name: 'B',
      })
      .mockResolvedValueOnce({
        id: 'v3',
        productId: 'p3',
        price: 300,
        name: 'C',
      });

    const result = await service.computePricing(
      [
        { productId: 'p1', quantity: 1 },
        { productId: 'p2', quantity: 1 },
        { productId: 'p3', quantity: 1 },
      ],
      500,
    );

    expect(result.compareAtTotal).toBe(600);
    expect(result.dealPrice).toBe(500);
    expect(result.savingsAmount).toBe(100);
    expect(result.allocations).toHaveLength(3);
    const allocatedSum = result.allocations.reduce(
      (sum, row) => sum + row.allocatedUnitPrice * row.quantity,
      0,
    );
    expect(allocatedSum).toBeCloseTo(500, 1);
  });
});

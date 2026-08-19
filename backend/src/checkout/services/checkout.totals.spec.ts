import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutTotalsService } from './checkout.totals';
import { PromotionsService } from '../../promotions/services/promotions.service';
import { ProductService } from '../../catalog/services/product.service';
import { TaxCalculationService } from '../../tax/services/calculation.service';
import { CustomerGroupService } from '../../customer-group/services/customer-group.service';
import { PrismaService } from '../../catalog/services/prisma.service';
import { StoreSettingsService } from '../../store-settings/services/store-settings.service';

describe('CheckoutTotalsService', () => {
  let service: CheckoutTotalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutTotalsService,
        { provide: PromotionsService, useValue: {} },
        { provide: ProductService, useValue: {} },
        { provide: TaxCalculationService, useValue: {} },
        { provide: CustomerGroupService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        {
          provide: StoreSettingsService,
          useValue: { getPublicOrderSettings: async () => ({}) },
        },
      ],
    }).compile();

    service = module.get<CheckoutTotalsService>(CheckoutTotalsService);
  });

  describe('calculateSubtotal', () => {
    it('should return 0 for empty items', () => {
      expect(service.calculateSubtotal([])).toBe(0);
    });

    it('should sum price * quantity for a single item', () => {
      const items = [
        {
          variantId: 'v1',
          productId: 'p1',
          quantity: 2,
          price: 100,
          currency: 'USD',
          attributes: {},
          reservationId: 'res-1',
        },
      ];
      expect(service.calculateSubtotal(items)).toBe(200);
    });

    it('should sum price * quantity for multiple items', () => {
      const items = [
        {
          variantId: 'v1',
          productId: 'p1',
          quantity: 2,
          price: 100,
          currency: 'USD',
          attributes: {},
          reservationId: 'res-1',
        },
        {
          variantId: 'v2',
          productId: 'p2',
          quantity: 1,
          price: 50,
          currency: 'USD',
          attributes: {},
          reservationId: 'res-2',
        },
      ];
      expect(service.calculateSubtotal(items)).toBe(250);
    });
  });
});

import { Module } from '@nestjs/common';
import { CheckoutController } from './controllers/checkout.controller';
import { CheckoutService } from './services/checkout.service';
import { CheckoutRedisService } from './services/checkout.redis';
import { InMemoryCheckoutService } from './services/checkout.memory';
import { CheckoutTotalsService } from './services/checkout.totals';
import { CheckoutValidatorService } from './services/checkout.validator';
import { CheckoutEventHandlers } from './events/checkout.handlers';
import { CartModule } from '../cart/cart.module';
import { OrderModule } from '../order/order.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PaymentModule } from '../payment/payment.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { CatalogModule } from '../catalog/catalog.module';
import { TaxModule } from '../tax/tax.module';
import { CustomerModule } from '../customer/customer.module';
import { CustomerGroupModule } from '../customer-group/customer-group.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { StoreSettingsModule } from '../store-settings/store-settings.module';

const useRedis = process.env.REDIS_ENABLED !== 'false';

@Module({
  imports: [
    CartModule,
    OrderModule,
    InventoryModule,
    PaymentModule,
    PromotionsModule,
    CatalogModule,
    TaxModule,
    CustomerModule,
    CustomerGroupModule,
    AnalyticsModule,
    StoreSettingsModule,
  ],
  controllers: [CheckoutController],
  providers: [
    CheckoutService,
    {
      provide: CheckoutRedisService,
      useClass: useRedis ? CheckoutRedisService : InMemoryCheckoutService,
    },
    CheckoutTotalsService,
    CheckoutValidatorService,
    CheckoutEventHandlers,
  ],
  exports: [CheckoutService, CheckoutRedisService],
})
export class CheckoutModule {}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { CheckoutModule } from './checkout/checkout.module';
import { PaymentModule } from './payment/payment.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ShippingModule } from './shipping/shipping.module';
import { TaxModule } from './tax/tax.module';
import { CustomerModule } from './customer/customer.module';
import { CustomerGroupModule } from './customer-group/customer-group.module';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { AdminModule } from './admin/admin.module';
import { CmsModule } from './cms/cms.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { MailModule } from './mail/mail.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SiteConfigModule } from './site-config/site-config.module';
import { StoreSettingsModule } from './store-settings/store-settings.module';
import { BundleDealsModule } from './bundle-deals/bundle-deals.module';
import { FeedsModule } from './feeds/feeds.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    CatalogModule,
    FeedsModule,
    AuthModule,
    AdminModule,
    InventoryModule,
    CartModule,
    OrderModule,
    CheckoutModule,
    PaymentModule,
    PromotionsModule,
    ShippingModule,
    TaxModule,
    CustomerModule,
    CustomerGroupModule,
    AddressModule,
    CmsModule,
    SubscriptionModule,
    MailModule,
    AnalyticsModule,
    SiteConfigModule,
    StoreSettingsModule,
    BundleDealsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

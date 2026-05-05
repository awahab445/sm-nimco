import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentFactory } from './services/payment.factory';
import { PaymentEventHandlers } from './events/payment.handlers';
import { StripeProvider } from './providers/stripe.provider';
import { EasyPaisaProvider } from './providers/easypaisa.provider';
import { JazzCashProvider } from './providers/jazzcash.provider';
import { HblProvider } from './providers/bank/hbl.provider';
import { UblProvider } from './providers/bank/ubl.provider';
import { OfflineCODProvider } from './providers/offline-cod.provider';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [CatalogModule, AdminModule], // For PrismaService and RBAC dependencies
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentFactory,
    PaymentEventHandlers,
    StripeProvider,
    EasyPaisaProvider,
    JazzCashProvider,
    HblProvider,
    UblProvider,
    OfflineCODProvider,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}


import { Module } from '@nestjs/common';
import { ShippingController, AdminShippingController } from './controllers/shipping.controller';
import { ShippingService } from './services/shipping.service';
import { CourierService } from './services/courier.service';
import { ShippingEligibilityEvaluator } from './services/shipping-eligibility-evaluator.service';
import { ShippingEventHandlers } from './events/shipping.handlers';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [CatalogModule], // For PrismaService
  controllers: [ShippingController, AdminShippingController],
  providers: [
    ShippingService,
    CourierService,
    ShippingEligibilityEvaluator,
    ShippingEventHandlers,
  ],
  exports: [ShippingService, CourierService, ShippingEligibilityEvaluator],
})
export class ShippingModule {}


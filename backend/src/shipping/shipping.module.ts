import { Module } from '@nestjs/common';
import { ShippingController, AdminShippingController } from './controllers/shipping.controller';
import { ShippingService } from './services/shipping.service';
import { CourierService } from './services/courier.service';
import { ShippingEligibilityEvaluator } from './services/shipping-eligibility-evaluator.service';
import { ShippingEventHandlers } from './events/shipping.handlers';
import { CatalogModule } from '../catalog/catalog.module';
import { AuthModule } from '../auth/auth.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  imports: [CatalogModule, AuthModule],
  controllers: [ShippingController, AdminShippingController],
  providers: [
    ShippingService,
    CourierService,
    ShippingEligibilityEvaluator,
    ShippingEventHandlers,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [ShippingService, CourierService, ShippingEligibilityEvaluator],
})
export class ShippingModule {}


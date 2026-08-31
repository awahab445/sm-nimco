import { Module } from '@nestjs/common';
import {
  ShippingController,
  AdminShippingController,
} from './controllers/shipping.controller';
import {
  ShippingRatesController,
  AdminShippingRatesController,
} from './controllers/shipping-rates.controller';
import { ShippingService } from './services/shipping.service';
import { ShippingRateService } from './services/shipping-rate.service';
import { CourierService } from './services/courier.service';
import { CourierCityService } from './services/courier-city.service';
import { CourierCityController } from './controllers/courier-city.controller';
import { AdminCourierZoneController } from './controllers/admin-courier-zone.controller';
import { ShippingEligibilityEvaluator } from './services/shipping-eligibility-evaluator.service';
import { ShippingEventHandlers } from './events/shipping.handlers';
import { CatalogModule } from '../catalog/catalog.module';
import { AuthModule } from '../auth/auth.module';
import { StoreSettingsModule } from '../store-settings/store-settings.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';
import { ZoneConfigService } from './services/zone-config.service';
import { AdminZoneConfigController } from './controllers/admin-zone-config.controller';

@Module({
  imports: [CatalogModule, AuthModule, StoreSettingsModule],
  controllers: [
    ShippingController,
    AdminShippingController,
    ShippingRatesController,
    AdminShippingRatesController,
    CourierCityController,
    AdminCourierZoneController,
    AdminZoneConfigController,
  ],
  providers: [
    ShippingService,
    ShippingRateService,
    CourierService,
    CourierCityService,
    ZoneConfigService,
    ShippingEligibilityEvaluator,
    ShippingEventHandlers,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [
    ShippingService,
    ShippingRateService,
    CourierService,
    CourierCityService,
    ZoneConfigService,
    ShippingEligibilityEvaluator,
  ],
})
export class ShippingModule {}

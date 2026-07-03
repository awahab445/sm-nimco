import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { AuthModule } from '../auth/auth.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';
import { BundleDealService } from './services/bundle-deal.service';
import { BundleDealPricingService } from './services/bundle-deal-pricing.service';
import { AdminBundleDealController } from './controllers/admin-bundle-deal.controller';
import { StorefrontBundleDealController } from './controllers/storefront-bundle-deal.controller';

@Module({
  imports: [CatalogModule, AuthModule],
  controllers: [AdminBundleDealController, StorefrontBundleDealController],
  providers: [
    BundleDealService,
    BundleDealPricingService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [BundleDealService, BundleDealPricingService],
})
export class BundleDealsModule {}

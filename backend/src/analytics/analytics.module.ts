import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { AnalyticsSettingsService } from './services/analytics-settings.service';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { StorefrontAnalyticsController } from './controllers/storefront-analytics.controller';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  imports: [CatalogModule],
  controllers: [AdminAnalyticsController, StorefrontAnalyticsController],
  providers: [
    AnalyticsSettingsService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [AnalyticsSettingsService],
})
export class AnalyticsModule {}

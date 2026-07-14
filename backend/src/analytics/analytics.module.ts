import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { CommonModule } from '../common/common.module';
import { CapiService } from '../common/services/capi.service';
import { AnalyticsSettingsService } from './services/analytics-settings.service';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { StorefrontAnalyticsController } from './controllers/storefront-analytics.controller';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  imports: [CatalogModule, CommonModule],
  controllers: [AdminAnalyticsController, StorefrontAnalyticsController],
  providers: [
    AnalyticsSettingsService,
    CapiService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [AnalyticsSettingsService, CapiService],
})
export class AnalyticsModule {}

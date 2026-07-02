import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminSiteConfigController } from './controllers/admin-site-config.controller';
import { StorefrontSiteConfigController } from './controllers/storefront-site-config.controller';
import { SiteConfigService } from './services/site-config.service';
import { AdminRbacService } from '../admin/services/admin-rbac.service';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';

@Module({
  imports: [CatalogModule],
  controllers: [AdminSiteConfigController, StorefrontSiteConfigController],
  providers: [
    SiteConfigService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}

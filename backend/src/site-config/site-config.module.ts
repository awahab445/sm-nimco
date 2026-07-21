import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminSiteConfigController } from './controllers/admin-site-config.controller';
import { StorefrontSiteConfigController } from './controllers/storefront-site-config.controller';
import { AdminSocialLinksController } from './controllers/admin-social-links.controller';
import { StorefrontSocialLinksController } from './controllers/storefront-social-links.controller';
import { SiteConfigService } from './services/site-config.service';
import { SocialLinksService } from './services/social-links.service';
import { AdminRbacService } from '../admin/services/admin-rbac.service';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';

@Module({
  imports: [CatalogModule],
  controllers: [
    AdminSiteConfigController,
    StorefrontSiteConfigController,
    AdminSocialLinksController,
    StorefrontSocialLinksController,
  ],
  providers: [
    SiteConfigService,
    SocialLinksService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [SiteConfigService, SocialLinksService],
})
export class SiteConfigModule {}

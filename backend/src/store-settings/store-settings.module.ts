import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';
import { AdminThemeController } from './controllers/admin-theme.controller';
import { StorefrontThemeController } from './controllers/storefront-theme.controller';
import { StoreSettingsService } from './services/store-settings.service';

@Module({
  imports: [CatalogModule],
  controllers: [StorefrontThemeController, AdminThemeController],
  providers: [
    StoreSettingsService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [StoreSettingsService],
})
export class StoreSettingsModule {}

import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { AuthModule } from '../auth/auth.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionAdminController } from './subscription.admin.controller';

@Module({
  imports: [CatalogModule, AuthModule],
  controllers: [SubscriptionController, SubscriptionAdminController],
  providers: [
    SubscriptionService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

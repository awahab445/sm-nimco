import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionAdminController } from './subscription.admin.controller';

@Module({
  imports: [CatalogModule, AdminModule, AuthModule],
  controllers: [SubscriptionController, SubscriptionAdminController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

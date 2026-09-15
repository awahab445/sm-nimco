import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { FcmService } from './fcm.service';
import { OrderPushHandlers } from './order-push.handlers';

@Module({
  imports: [CatalogModule],
  providers: [FcmService, OrderPushHandlers],
  exports: [FcmService],
})
export class NotificationsModule {}

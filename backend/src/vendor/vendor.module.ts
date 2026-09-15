import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';
import { CatalogModule } from '../catalog/catalog.module';
import { SessionModule } from '../sessions/session.module';
import { VendorAuthController } from './controllers/vendor-auth.controller';
import { VendorOrderController } from './controllers/vendor-order.controller';
import { VendorSessionController } from './controllers/vendor-session.controller';
import { VendorSessionController } from './controllers/vendor-session.controller';
import { StoreAuthService } from './services/store-auth.service';
import { VendorOrderService } from './services/vendor-order.service';
import { FcmService } from './services/fcm.service';
import { VendorNotificationHandlers } from './events/vendor-notification.handlers';

@Module({
  imports: [AuthModule, AdminModule, CatalogModule],
  controllers: [
    VendorAuthController,
    VendorOrderController,
    VendorSessionController,
  ],
  providers: [
    StoreAuthService,
    VendorOrderService,
    FcmService,
    VendorNotificationHandlers,
  ],
  exports: [FcmService],
})
export class VendorModule {}

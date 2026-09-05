import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';
import { CatalogModule } from '../catalog/catalog.module';
import { SessionModule } from '../sessions/session.module';
import { VendorAuthController } from './controllers/vendor-auth.controller';
import { VendorOrderController } from './controllers/vendor-order.controller';
import { VendorSessionController } from './controllers/vendor-session.controller';
import { StoreAuthService } from './services/store-auth.service';
import { VendorOrderService } from './services/vendor-order.service';
import { VendorBlockedGuard } from './guards/vendor-blocked.guard';

@Module({
  imports: [AuthModule, AdminModule, CatalogModule, SessionModule],
  controllers: [
    VendorAuthController,
    VendorOrderController,
    VendorSessionController,
  ],
  providers: [StoreAuthService, VendorOrderService, VendorBlockedGuard],
})
export class VendorModule {}

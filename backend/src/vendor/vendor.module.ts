import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';
import { CatalogModule } from '../catalog/catalog.module';
import { OrderModule } from '../order/order.module';
import { VendorAuthController } from './controllers/vendor-auth.controller';
import { VendorOrderController } from './controllers/vendor-order.controller';
import { StoreAuthService } from './services/store-auth.service';
import { VendorOrderService } from './services/vendor-order.service';

@Module({
  imports: [AuthModule, AdminModule, CatalogModule, OrderModule],
  controllers: [VendorAuthController, VendorOrderController],
  providers: [StoreAuthService, VendorOrderService],
})
export class VendorModule {}

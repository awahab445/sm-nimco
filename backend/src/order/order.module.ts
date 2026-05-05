import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { AdminOrderController } from './controllers/admin-order.controller';
import { OrderService } from './services/order.service';
import { OrderFactory } from './services/order.factory';
import { OrderEventHandlers } from './events/order.handlers';
import { CatalogModule } from '../catalog/catalog.module';
import { CartModule } from '../cart/cart.module';
import { TaxModule } from '../tax/tax.module';
import { AuthModule } from '../auth/auth.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  imports: [CatalogModule, CartModule, TaxModule, AuthModule],
  controllers: [OrderController, AdminOrderController],
  providers: [
    OrderService,
    OrderFactory,
    OrderEventHandlers,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [OrderService],
})
export class OrderModule {}


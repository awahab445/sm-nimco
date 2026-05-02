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

@Module({
  imports: [CatalogModule, CartModule, TaxModule, AuthModule],
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService, OrderFactory, OrderEventHandlers],
  exports: [OrderService],
})
export class OrderModule {}


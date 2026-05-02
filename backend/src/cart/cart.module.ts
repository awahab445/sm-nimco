import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { CartService } from './services/cart.service';
import { CartRedisService } from './services/cart.redis';
import { InMemoryCartService } from './services/cart.memory';
import { CartEventHandlers } from './events/cart.handlers';
import { CatalogModule } from '../catalog/catalog.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PromotionsModule } from '../promotions/promotions.module';

const useRedis = process.env.REDIS_ENABLED !== 'false';

@Module({
  imports: [CatalogModule, InventoryModule, PromotionsModule],
  controllers: [CartController],
  providers: [
    CartService,
    {
      provide: CartRedisService,
      useClass: useRedis ? CartRedisService : InMemoryCartService,
    },
    CartEventHandlers,
  ],
  exports: [CartService, CartRedisService],
})
export class CartModule {}


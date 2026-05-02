import { Module } from '@nestjs/common';
import { InventoryController } from './controllers/inventory.controller';
import { AdminInventoryController } from './controllers/admin-inventory.controller';
import { InventoryService } from './services/inventory.service';
import { ReservationService } from './services/reservation.service';
import { InventoryEventHandlers } from './events/inventory.handlers';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [CatalogModule],
  controllers: [InventoryController, AdminInventoryController],
  providers: [InventoryService, ReservationService, InventoryEventHandlers],
  exports: [InventoryService, ReservationService],
})
export class InventoryModule {}


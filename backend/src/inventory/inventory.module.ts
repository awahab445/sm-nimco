import { Module } from '@nestjs/common';
import { InventoryController } from './controllers/inventory.controller';
import { AdminInventoryController } from './controllers/admin-inventory.controller';
import { InventoryService } from './services/inventory.service';
import { ReservationService } from './services/reservation.service';
import { InventoryEventHandlers } from './events/inventory.handlers';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  imports: [CatalogModule],
  controllers: [InventoryController, AdminInventoryController],
  providers: [
    InventoryService,
    ReservationService,
    InventoryEventHandlers,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [InventoryService, ReservationService],
})
export class InventoryModule {}

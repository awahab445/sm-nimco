import { Module } from '@nestjs/common';
import { TaxController } from './controllers/tax.controller';
import { TaxService } from './services/tax.service';
import { TaxCalculationService } from './services/calculation.service';
import { TaxEventHandlers } from './events/tax.handlers';
import { CatalogModule } from '../catalog/catalog.module';
import { AuthModule } from '../auth/auth.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  imports: [CatalogModule, AuthModule],
  controllers: [TaxController],
  providers: [
    TaxService,
    TaxCalculationService,
    TaxEventHandlers,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [TaxService, TaxCalculationService],
})
export class TaxModule {}

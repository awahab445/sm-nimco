import { Module } from '@nestjs/common';
import { AdminCustomerGroupController } from './controllers/admin-customer-group.controller';
import { CustomerGroupService } from './services/customer-group.service';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  imports: [CatalogModule], // For PrismaService
  controllers: [AdminCustomerGroupController],
  providers: [
    CustomerGroupService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [CustomerGroupService],
})
export class CustomerGroupModule {}

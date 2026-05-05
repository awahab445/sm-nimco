import { Module } from '@nestjs/common';
import { AdminCustomerController } from './controllers/admin-customer.controller';
import { CustomerController } from './controllers/customer.controller';
import { CustomerService } from './services/customer.service';
import { CatalogModule } from '../catalog/catalog.module';
import { CustomerGroupModule } from '../customer-group/customer-group.module';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  imports: [CatalogModule, CustomerGroupModule, forwardRef(() => AuthModule)],
  controllers: [AdminCustomerController, CustomerController],
  providers: [
    CustomerService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}


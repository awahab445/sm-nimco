import { Module } from '@nestjs/common';
import { AdminCustomerController } from './controllers/admin-customer.controller';
import { CustomerController } from './controllers/customer.controller';
import { CustomerService } from './services/customer.service';
import { CatalogModule } from '../catalog/catalog.module';
import { CustomerGroupModule } from '../customer-group/customer-group.module';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CatalogModule, CustomerGroupModule, forwardRef(() => AuthModule)],
  controllers: [AdminCustomerController, CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}


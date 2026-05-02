import { Module } from '@nestjs/common';
import { AdminCustomerGroupController } from './controllers/admin-customer-group.controller';
import { CustomerGroupService } from './services/customer-group.service';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [CatalogModule], // For PrismaService
  controllers: [AdminCustomerGroupController],
  providers: [CustomerGroupService],
  exports: [CustomerGroupService],
})
export class CustomerGroupModule {}


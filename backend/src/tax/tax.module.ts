import { Module } from '@nestjs/common';
import { TaxController } from './controllers/tax.controller';
import { TaxService } from './services/tax.service';
import { TaxCalculationService } from './services/calculation.service';
import { TaxEventHandlers } from './events/tax.handlers';
import { PrismaService } from '../catalog/services/prisma.service';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [CatalogModule],
  controllers: [TaxController],
  providers: [
    TaxService,
    TaxCalculationService,
    TaxEventHandlers,
  ],
  exports: [TaxService, TaxCalculationService],
})
export class TaxModule {}


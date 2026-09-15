import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { SessionService } from './session.service';

@Module({
  imports: [CatalogModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}

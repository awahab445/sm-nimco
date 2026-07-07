import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminModule } from '../admin/admin.module';
import { CmsService } from './services/cms.service';
import { CmsController } from './controllers/cms.controller';
import { PagesController } from './controllers/pages.controller';
import { AdminCmsController } from './controllers/admin-cms.controller';
import { AdminPagesController } from './controllers/admin-pages.controller';

@Module({
  imports: [CatalogModule, AdminModule],
  controllers: [CmsController, PagesController, AdminCmsController, AdminPagesController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}

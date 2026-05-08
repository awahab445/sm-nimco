import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { AdminProductController } from './controllers/admin-product.controller';
import { CategoryController } from './controllers/category.controller';
import { AdminCategoryController } from './controllers/admin-category.controller';
import {
  AdminProductOptionsController,
  AdminProductOptionValuesController,
} from './controllers/admin-product-options.controller';
import { ProductService } from './services/product.service';
import { VariantService } from './services/variant.service';
import { ImageService } from './services/image.service';
import { CategoryService } from './services/category.service';
import { PrismaService } from './services/prisma.service';
import { ProductOptionsService } from './services/product-options.service';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  controllers: [
    ProductController,
    AdminProductController,
    AdminProductOptionsController,
    AdminProductOptionValuesController,
    CategoryController,
    AdminCategoryController,
  ],
  providers: [
    PrismaService,
    ProductService,
    VariantService,
    ImageService,
    CategoryService,
    ProductOptionsService,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [
    ProductService,
    VariantService,
    ImageService,
    CategoryService,
    ProductOptionsService,
    PrismaService,
  ],
})
export class CatalogModule {}


import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { AdminProductController } from './controllers/admin-product.controller';
import { CategoryController } from './controllers/category.controller';
import { AdminCategoryController } from './controllers/admin-category.controller';
import { AdminStorefrontFiltersController } from './controllers/admin-storefront-filters.controller';
import { StorefrontNavController } from './controllers/storefront-nav.controller';
import { AdminStorefrontNavController } from './controllers/admin-storefront-nav.controller';
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
import { StorefrontFilterService } from './services/storefront-filter.service';
import { StorefrontNavService } from './services/storefront-nav.service';
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
    AdminStorefrontFiltersController,
    StorefrontNavController,
    AdminStorefrontNavController,
  ],
  providers: [
    PrismaService,
    ProductService,
    VariantService,
    ImageService,
    CategoryService,
    ProductOptionsService,
    StorefrontFilterService,
    StorefrontNavService,
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


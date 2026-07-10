import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * List categories for storefront (nav, filters).
   * GET /categories?tree=true for nested tree; default flat list.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('tree') tree?: string,
    @Query('parentId') parentId?: string,
  ) {
    const parentIdVal =
      parentId === 'null' || parentId === '' ? null : parentId;
    return this.categoryService.findAll({
      tree: tree === 'true',
      parentId: parentIdVal,
    });
  }

  /**
   * Get category by slug for storefront category page.
   * GET /categories/slug/:slug
   */
  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  async findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }
}

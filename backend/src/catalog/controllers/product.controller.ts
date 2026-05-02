import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ProductQueryDto } from '../dto/product-query.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.findSearchSuggestions(q ?? '', limit ? parseInt(limit, 10) : undefined);
  }

  @Get('id/:id')
  @HttpCode(HttpStatus.OK)
  async findOneById(@Param('id') id: string) {
    return this.productService.findOneById(id);
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    return this.productService.findOneBySlug(slug);
  }
}


import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { VariantService } from '../services/variant.service';
import { ImageService } from '../services/image.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';
import { CreateImageDto } from '../dto/create-image.dto';
import { UpdateImageDto } from '../dto/update-image.dto';
import { AssignCategoryDto } from '../dto/assign-category.dto';

@Controller('admin/products')
export class AdminProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly variantService: VariantService,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.productService.findOneById(id, true);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Post(':id/variants')
  @HttpCode(HttpStatus.CREATED)
  async createVariant(
    @Param('id') productId: string,
    @Body() createVariantDto: CreateVariantDto,
  ) {
    return this.variantService.create(productId, createVariantDto);
  }

  @Patch('variants/:id')
  @HttpCode(HttpStatus.OK)
  async updateVariant(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.variantService.update(id, updateVariantDto);
  }

  @Delete('variants/:id')
  @HttpCode(HttpStatus.OK)
  async removeVariant(@Param('id') id: string) {
    return this.variantService.remove(id);
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.CREATED)
  async createImage(
    @Param('id') productId: string,
    @Body() createImageDto: CreateImageDto,
  ) {
    return this.imageService.create(productId, createImageDto);
  }

  @Patch('images/:id')
  @HttpCode(HttpStatus.OK)
  async updateImage(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    return this.imageService.update(id, updateImageDto);
  }

  @Delete('images/:id')
  @HttpCode(HttpStatus.OK)
  async removeImage(@Param('id') id: string) {
    return this.imageService.remove(id);
  }

  @Post(':id/categories')
  @HttpCode(HttpStatus.CREATED)
  async assignCategory(
    @Param('id') productId: string,
    @Body() assignCategoryDto: AssignCategoryDto,
  ) {
    return this.productService.assignCategory(
      productId,
      assignCategoryDto.categoryId,
      assignCategoryDto.position,
    );
  }
}


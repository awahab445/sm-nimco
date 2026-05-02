import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';
import { ProductService } from './product.service';

@Injectable()
export class VariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
  ) {}

  async validateSkuUniqueness(sku: string, excludeVariantId?: string): Promise<void> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { sku },
      select: { id: true },
    });

    if (variant && variant.id !== excludeVariantId) {
      throw new ConflictException(`SKU ${sku} already exists in variants`);
    }

    const product = await this.prisma.product.findUnique({
      where: { sku },
      select: { id: true },
    });

    if (product) {
      throw new ConflictException(`SKU ${sku} already exists in products`);
    }
  }

  async create(productId: string, createVariantDto: CreateVariantDto) {
    await this.productService.findOneById(productId);

    await this.validateSkuUniqueness(createVariantDto.sku);

    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        sku: createVariantDto.sku,
        name: createVariantDto.name,
        price: createVariantDto.price,
        cost: createVariantDto.cost,
        weight: createVariantDto.weight,
        attributes: createVariantDto.attributes || {},
        position: createVariantDto.position || 0,
        isActive: createVariantDto.isActive ?? true,
      },
      include: {
        product: true,
        images: true,
      },
    });

    return variant;
  }

  async findOne(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with id ${id} not found`);
    }

    return variant;
  }

  /**
   * For cart: return variant by id, or a synthetic variant for a simple product when variantId === productId.
   * Simple products have no variants; the product itself is the sellable unit.
   */
  async findOneOrForSimpleProduct(variantId: string, productId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
        },
      },
    });

    if (variant) {
      if (variant.productId !== productId) {
        throw new BadRequestException(
          `Variant ${variantId} does not belong to product ${productId}`,
        );
      }
      return variant;
    }

    if (variantId !== productId) {
      throw new NotFoundException(`Variant with id ${variantId} not found`);
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: { variants: { where: { isActive: true }, take: 1 } },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    if (product.type != null && product.type !== 'simple') {
      throw new BadRequestException(
        `Product ${productId} is not a simple product. Use a variant id to add to cart.`,
      );
    }

    if (product.variants && product.variants.length > 0) {
      throw new BadRequestException(
        `Product ${productId} has variants. Use a variant id to add to cart.`,
      );
    }

    return {
      id: product.id,
      productId: product.id,
      sku: product.sku,
      name: product.name,
      price: product.basePrice,
      cost: product.cost,
      weight: product.weight,
      attributes: (product.attributes as object) ?? {},
      position: 0,
      isActive: true,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      product,
      images: [],
    };
  }

  async update(id: string, updateVariantDto: UpdateVariantDto) {
    await this.findOne(id);

    if (updateVariantDto.sku) {
      await this.validateSkuUniqueness(updateVariantDto.sku, id);
    }

    const variant = await this.prisma.productVariant.update({
      where: { id },
      data: {
        ...(updateVariantDto.sku && { sku: updateVariantDto.sku }),
        ...(updateVariantDto.name && { name: updateVariantDto.name }),
        ...(updateVariantDto.price !== undefined && { price: updateVariantDto.price }),
        ...(updateVariantDto.cost !== undefined && { cost: updateVariantDto.cost }),
        ...(updateVariantDto.weight !== undefined && { weight: updateVariantDto.weight }),
        ...(updateVariantDto.attributes !== undefined && {
          attributes: updateVariantDto.attributes,
        }),
        ...(updateVariantDto.position !== undefined && {
          position: updateVariantDto.position,
        }),
        ...(updateVariantDto.isActive !== undefined && {
          isActive: updateVariantDto.isActive,
        }),
      },
      include: {
        product: true,
        images: true,
      },
    });

    return variant;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.productVariant.delete({
      where: { id },
    });

    return { message: 'Variant deleted successfully' };
  }
}


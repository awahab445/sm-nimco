import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateImageDto } from '../dto/create-image.dto';
import { UpdateImageDto } from '../dto/update-image.dto';
import { ProductService } from './product.service';
import { VariantService } from './variant.service';

@Injectable()
export class ImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly variantService: VariantService,
  ) {}

  async ensureSinglePrimary(productId: string, variantId: string | null) {
    if (variantId) {
      await this.prisma.productImage.updateMany({
        where: {
          variantId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    } else {
      await this.prisma.productImage.updateMany({
        where: {
          productId,
          variantId: null,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }
  }

  async create(productId: string, createImageDto: CreateImageDto) {
    await this.productService.findOneById(productId);

    if (createImageDto.variantId) {
      const variant = await this.variantService.findOne(createImageDto.variantId);
      if (variant.productId !== productId) {
        throw new BadRequestException(
          'Variant does not belong to the specified product',
        );
      }
    }

    if (createImageDto.isPrimary) {
      await this.ensureSinglePrimary(productId, createImageDto.variantId || null);
    }

    const image = await this.prisma.productImage.create({
      data: {
        productId,
        variantId: createImageDto.variantId || null,
        url: createImageDto.url,
        altText: createImageDto.altText,
        position: createImageDto.position || 0,
        isPrimary: createImageDto.isPrimary || false,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    return image;
  }

  async findOne(id: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }

    return image;
  }

  async update(id: string, updateImageDto: UpdateImageDto) {
    const image = await this.findOne(id);

    if (updateImageDto.isPrimary && !image.isPrimary) {
      await this.ensureSinglePrimary(image.productId, image.variantId);
    }

    const updatedImage = await this.prisma.productImage.update({
      where: { id },
      data: {
        ...(updateImageDto.url && { url: updateImageDto.url }),
        ...(updateImageDto.altText !== undefined && { altText: updateImageDto.altText }),
        ...(updateImageDto.position !== undefined && { position: updateImageDto.position }),
        ...(updateImageDto.isPrimary !== undefined && {
          isPrimary: updateImageDto.isPrimary,
        }),
      },
      include: {
        product: true,
        variant: true,
      },
    });

    return updatedImage;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.productImage.delete({
      where: { id },
    });

    return { message: 'Image deleted successfully' };
  }
}


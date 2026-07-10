import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateProductOptionDto } from '../dto/create-product-option.dto';
import { UpdateProductOptionDto } from '../dto/update-product-option.dto';
import { CreateProductOptionValueDto } from '../dto/create-product-option-value.dto';
import { UpdateProductOptionValueDto } from '../dto/update-product-option-value.dto';
import { UpsertProductOptionsDto } from '../dto/upsert-product-options.dto';
import { ProductService } from './product.service';

function normalizeOptionCode(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

@Injectable()
export class ProductOptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
  ) {}

  async listOptionsAdmin() {
    return this.prisma.productOption.findMany({
      orderBy: [{ name: 'asc' }],
      include: {
        values: { orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }] },
      },
    });
  }

  async createOption(dto: CreateProductOptionDto) {
    const code = normalizeOptionCode(dto.code);
    if (!code) throw new BadRequestException('Option code is required');
    try {
      return await this.prisma.productOption.create({
        data: {
          name: dto.name.trim(),
          code,
          isActive: dto.isActive ?? true,
        },
        include: {
          values: { orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }] },
        },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2002') {
        throw new ConflictException(`Option code "${code}" already exists`);
      }
      throw e;
    }
  }

  async updateOption(id: string, dto: UpdateProductOptionDto) {
    const existing = await this.prisma.productOption.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Product option ${id} not found`);
    const nextCode = dto.code ? normalizeOptionCode(dto.code) : undefined;
    try {
      return await this.prisma.productOption.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(nextCode !== undefined ? { code: nextCode } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
        include: {
          values: { orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }] },
        },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2002') {
        throw new ConflictException(`Option code "${nextCode}" already exists`);
      }
      throw e;
    }
  }

  async deleteOption(id: string) {
    const existing = await this.prisma.productOption.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Product option ${id} not found`);
    await this.prisma.productOption.delete({ where: { id } });
    return { message: 'Option deleted successfully' };
  }

  async createOptionValue(optionId: string, dto: CreateProductOptionValueDto) {
    const option = await this.prisma.productOption.findUnique({
      where: { id: optionId },
    });
    if (!option)
      throw new NotFoundException(`Product option ${optionId} not found`);
    try {
      return await this.prisma.productOptionValue.create({
        data: {
          optionId,
          value: dto.value.trim(),
          code: dto.code?.trim() || null,
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2002') {
        throw new ConflictException(
          `Value "${dto.value}" already exists for option ${option.code}`,
        );
      }
      throw e;
    }
  }

  async updateOptionValue(valueId: string, dto: UpdateProductOptionValueDto) {
    const existing = await this.prisma.productOptionValue.findUnique({
      where: { id: valueId },
    });
    if (!existing)
      throw new NotFoundException(`Option value ${valueId} not found`);
    try {
      return await this.prisma.productOptionValue.update({
        where: { id: valueId },
        data: {
          ...(dto.value !== undefined ? { value: dto.value.trim() } : {}),
          ...(dto.code !== undefined ? { code: dto.code?.trim() || null } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2002') {
        throw new ConflictException(
          `Value "${dto.value}" already exists for this option`,
        );
      }
      throw e;
    }
  }

  async deleteOptionValue(valueId: string) {
    const existing = await this.prisma.productOptionValue.findUnique({
      where: { id: valueId },
    });
    if (!existing)
      throw new NotFoundException(`Option value ${valueId} not found`);
    await this.prisma.productOptionValue.delete({ where: { id: valueId } });
    return { message: 'Option value deleted successfully' };
  }

  async getProductOptions(productId: string) {
    await this.productService.findOneById(productId, true);
    const productOptions = await this.prisma.productOptionOnProduct.findMany({
      where: { productId },
      orderBy: [{ position: 'asc' }],
      include: {
        option: {
          include: {
            values: { orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }] },
          },
        },
        values: { include: { value: true } },
      },
    });
    return productOptions;
  }

  /**
   * Replace product option selections in one transaction.
   * Each selected option must include at least one valueId.
   */
  async upsertProductOptions(productId: string, dto: UpsertProductOptionsDto) {
    await this.productService.findOneById(productId, true);
    const optionIds = dto.options.map((o) => o.optionId);
    const uniqueOptionIds = new Set(optionIds);
    if (uniqueOptionIds.size !== optionIds.length) {
      throw new BadRequestException(
        'Duplicate optionId entries are not allowed',
      );
    }

    const options = await this.prisma.productOption.findMany({
      where: { id: { in: optionIds } },
      select: { id: true },
    });
    if (options.length !== optionIds.length) {
      throw new BadRequestException('One or more options not found');
    }

    const allValueIds = dto.options.flatMap((o) => o.valueIds);
    const values = await this.prisma.productOptionValue.findMany({
      where: { id: { in: allValueIds } },
      select: { id: true, optionId: true },
    });
    if (values.length !== new Set(allValueIds).size) {
      throw new BadRequestException('One or more option values not found');
    }

    const valueToOption = new Map(values.map((v) => [v.id, v.optionId]));
    for (const sel of dto.options) {
      for (const vid of sel.valueIds) {
        if (valueToOption.get(vid) !== sel.optionId) {
          throw new BadRequestException(
            'Selected values must belong to their option',
          );
        }
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.productOptionValueOnProduct.deleteMany({ where: { productId } });
      await tx.productOptionOnProduct.deleteMany({ where: { productId } });

      for (let i = 0; i < dto.options.length; i++) {
        const sel = dto.options[i];
        const position = sel.position ?? i;
        await tx.productOptionOnProduct.create({
          data: {
            productId,
            optionId: sel.optionId,
            isRequired: sel.isRequired ?? false,
            position,
          },
        });
        for (const valueId of sel.valueIds) {
          await tx.productOptionValueOnProduct.create({
            data: { productId, optionId: sel.optionId, valueId },
          });
        }
      }
    });

    return this.getProductOptions(productId);
  }
}

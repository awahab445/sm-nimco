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
    const product = await this.productService.findOneById(productId);

    await this.validateSkuUniqueness(createVariantDto.sku);

    if (product.type !== 'configurable') {
      await this.prisma.product.update({
        where: { id: productId },
        data: { type: 'configurable' },
      });
    }

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

  private skuToken(v: string): string {
    return v
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private buildSignature(pairs: Array<{ optionId: string; valueId: string }>): string {
    return pairs
      .slice()
      .sort((a, b) => a.optionId.localeCompare(b.optionId))
      .map((p) => `${p.optionId}:${p.valueId}`)
      .join('|');
  }

  /**
   * Generate variants for a product based on the option/value selections saved on the product.
   * Existing variants with the same option-value signature are skipped.
   */
  async createCombinationsFromProductOptions(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: {
        id: true,
        sku: true,
        name: true,
        type: true,
        basePrice: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    if (product.type !== 'configurable') {
      await this.prisma.product.update({
        where: { id: productId },
        data: { type: 'configurable' },
      });
    }

    const productOptions = await this.prisma.productOptionOnProduct.findMany({
      where: { productId },
      orderBy: [{ position: 'asc' }],
      include: {
        option: true,
        values: { include: { value: true } },
      },
    });

    const usable = productOptions
      .map((po) => ({
        optionId: po.optionId,
        optionCode: po.option.code,
        optionName: po.option.name,
        isRequired: po.isRequired,
        position: po.position,
        values: po.values
          .map((v) => v.value)
          .filter((v) => v.isActive)
          .sort((a, b) => (a.sortOrder - b.sortOrder) || a.value.localeCompare(b.value)),
      }))
      .filter((o) => {
        if (o.isRequired && o.values.length === 0) return true;
        return o.values.length > 0;
      });

    for (const o of usable) {
      if (o.isRequired && o.values.length === 0) {
        throw new BadRequestException(
          `Required option "${o.optionName}" must have at least one selected value`,
        );
      }
    }

    const optionsForCombos = usable.filter((o) => o.values.length > 0);
    if (optionsForCombos.length === 0) {
      throw new BadRequestException('Select at least one option value before creating combinations');
    }

    // Cartesian product of option values (ordered by product option position)
    type ComboPick = { optionId: string; optionCode: string; optionName: string; valueId: string; value: string; valueCode?: string | null };
    const combos: ComboPick[][] = [];
    const build = (idx: number, acc: ComboPick[]) => {
      if (idx >= optionsForCombos.length) {
        combos.push(acc.slice());
        return;
      }
      const opt = optionsForCombos[idx];
      for (const val of opt.values) {
        build(idx + 1, acc.concat([{
          optionId: opt.optionId,
          optionCode: opt.optionCode,
          optionName: opt.optionName,
          valueId: val.id,
          value: val.value,
          valueCode: val.code,
        }]));
      }
    };
    build(0, []);

    const existingVariants = await this.prisma.productVariant.findMany({
      where: { productId },
      select: {
        id: true,
        sku: true,
        optionValues: { select: { optionId: true, valueId: true } },
      },
    });

    const existingSignatures = new Set(
      existingVariants.map((v) =>
        this.buildSignature(v.optionValues.map((p) => ({ optionId: p.optionId, valueId: p.valueId }))),
      ),
    );
    const existingSkus = new Set(existingVariants.map((v) => v.sku.toUpperCase()));

    let created = 0;
    let skipped = 0;

    for (const picks of combos) {
      const signature = this.buildSignature(picks.map((p) => ({ optionId: p.optionId, valueId: p.valueId })));
      if (existingSignatures.has(signature)) {
        skipped += 1;
        continue;
      }

      const skuBase = [
        product.sku,
        ...picks.map((p) => this.skuToken(p.valueCode?.trim() || p.value)),
      ]
        .filter((t) => !!t)
        .join('-');

      let skuCandidate = skuBase;
      let suffix = 1;
      while (existingSkus.has(skuCandidate.toUpperCase())) {
        suffix += 1;
        skuCandidate = `${skuBase}-${suffix}`;
      }

      // Defensive uniqueness check across products + variants.
      await this.validateSkuUniqueness(skuCandidate);

      const name = picks.map((p) => `${p.optionName}: ${p.value}`).join(' • ');
      const optionValuesMap: Record<string, string> = {};
      const optionValueIdsMap: Record<string, string> = {};
      for (const p of picks) {
        optionValuesMap[p.optionCode] = p.value;
        optionValueIdsMap[p.optionCode] = p.valueId;
      }

      await this.prisma.$transaction(async (tx) => {
        const createdVariant = await tx.productVariant.create({
          data: {
            productId,
            sku: skuCandidate,
            name,
            price: product.basePrice,
            position: existingVariants.length + created,
            isActive: true,
            attributes: {
              optionValues: optionValuesMap,
              optionValueIds: optionValueIdsMap,
            },
          },
          select: { id: true },
        });

        for (const p of picks) {
          await tx.variantOptionValue.create({
            data: {
              variantId: createdVariant.id,
              optionId: p.optionId,
              valueId: p.valueId,
            },
          });
        }
      });

      existingSkus.add(skuCandidate.toUpperCase());
      existingSignatures.add(signature);
      created += 1;
    }

    return {
      created,
      skipped,
      totalRequested: combos.length,
    };
  }
}


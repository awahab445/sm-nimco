import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateProductDto, ProductStatus } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import {
  ProductQuery,
  expandCategoryFilterWithDescendants,
} from '../queries/product.query';
import { ProductQueryDto } from '../dto/product-query.dto';
import { ProductFacetAggregate } from '../queries/product-facet-aggregate';
import { AdminProductListQueryDto } from '../dto/admin-product-list-query.dto';
import { normalizeShippingWeightUnit } from '../../shipping/utils/shipping-weight';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  /** Normalize a raw slug string: lowercase, trim, replace spaces/special chars with hyphens. */
  private normalizeSlug(raw: string): string {
    return raw
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async generateSlug(name: string, existingId?: string): Promise<string> {
    const baseSlug = this.normalizeSlug(name);

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing || (existingId && existing.id === existingId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async validateSkuUniqueness(
    sku: string,
    excludeProductId?: string,
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      select: { id: true },
    });

    if (product && product.id !== excludeProductId) {
      throw new ConflictException(`SKU ${sku} already exists`);
    }

    const variant = await this.prisma.productVariant.findUnique({
      where: { sku },
      select: { id: true },
    });

    if (variant) {
      throw new ConflictException(`SKU ${sku} already exists in variants`);
    }
  }

  async create(createProductDto: CreateProductDto) {
    await this.validateSkuUniqueness(createProductDto.sku);

    const slug = createProductDto.slug
      ? this.normalizeSlug(createProductDto.slug)
      : await this.generateSlug(createProductDto.name);

    const product = await this.prisma.product.create({
      data: {
        sku: createProductDto.sku,
        name: createProductDto.name,
        slug,
        type: createProductDto.type,
        description: createProductDto.description,
        shortDescription: createProductDto.shortDescription,
        seoTitle: createProductDto.seoTitle,
        metaDescription: createProductDto.metaDescription,
        tasteProfile: createProductDto.tasteProfile,
        ingredients: createProductDto.ingredients,
        servingSuggestions: createProductDto.servingSuggestions,
        storageInstructions: createProductDto.storageInstructions,
        dietaryHighlights: createProductDto.dietaryHighlights,
        spiceLevel: createProductDto.spiceLevel,
        faqs: createProductDto.faqs,
        focusKeywords: createProductDto.focusKeywords,
        productTags: createProductDto.productTags,
        basePrice: createProductDto.basePrice,
        cost: createProductDto.cost,
        weight: createProductDto.weight,
        ...(createProductDto.shippingWeight !== undefined && {
          shippingWeight: createProductDto.shippingWeight,
        }),
        ...(createProductDto.shippingWeightUnit !== undefined && {
          shippingWeightUnit: normalizeShippingWeightUnit(
            createProductDto.shippingWeightUnit,
          ),
        }),
        status: createProductDto.status || ProductStatus.DRAFT,
        visibility: createProductDto.visibility || 'both',
        taxClassId: createProductDto.taxClassId,
        attributes: createProductDto.attributes || {},
        metaData: createProductDto.metaData || {},
      },
      include: ProductQuery.buildAdminProductDetailInclude(),
    });

    return product;
  }

  /**
   * Bulk upsert products by SKU.
   * Existing SKUs update SEO/content fields; new SKUs are inserted via createMany.
   */
  async createMany(dtos: CreateProductDto[]) {
    if (!dtos.length) {
      throw new BadRequestException('At least one product is required.');
    }
    if (dtos.length > 500) {
      throw new BadRequestException('A maximum of 500 products can be uploaded at once.');
    }

    const normalizedSkus = dtos.map((dto) => String(dto.sku ?? '').trim());
    if (normalizedSkus.some((sku) => !sku)) {
      throw new BadRequestException('Every product requires a non-empty SKU.');
    }

    const skuCounts = new Map<string, number>();
    for (const sku of normalizedSkus) {
      const key = sku.toLowerCase();
      skuCounts.set(key, (skuCounts.get(key) ?? 0) + 1);
    }
    const duplicateSkus = [...skuCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([sku]) => sku);
    if (duplicateSkus.length > 0) {
      throw new ConflictException(
        `Duplicate SKUs in upload: ${duplicateSkus.slice(0, 10).join(', ')}${duplicateSkus.length > 10 ? '…' : ''}`,
      );
    }

    const existingProducts = await this.prisma.product.findMany({
      where: { sku: { in: normalizedSkus } },
      select: { id: true, sku: true },
    });
    const existingBySku = new Map(
      existingProducts.map((p) => [p.sku, p] as const),
    );

    const toCreateDtos: Array<{ dto: CreateProductDto; sku: string; index: number }> =
      [];
    const toUpdate: Array<{ id: string; dto: CreateProductDto }> = [];

    for (let index = 0; index < dtos.length; index++) {
      const dto = dtos[index];
      const sku = normalizedSkus[index];
      const existing = existingBySku.get(sku);
      if (existing) {
        toUpdate.push({ id: existing.id, dto });
      } else {
        toCreateDtos.push({ dto, sku, index });
      }
    }

    if (toCreateDtos.length > 0) {
      const createSkus = toCreateDtos.map((row) => row.sku);
      const existingVariants = await this.prisma.productVariant.findMany({
        where: { sku: { in: createSkus } },
        select: { sku: true },
      });
      if (existingVariants.length > 0) {
        throw new ConflictException(
          `SKU already exists in variants: ${existingVariants
            .slice(0, 10)
            .map((v) => v.sku)
            .join(', ')}${existingVariants.length > 10 ? '…' : ''}`,
        );
      }
    }

    let updatedCount = 0;
    if (toUpdate.length > 0) {
      await this.prisma.$transaction(
        toUpdate.map(({ id, dto }) =>
          this.prisma.product.update({
            where: { id },
            data: this.buildBulkContentUpdate(dto),
          }),
        ),
      );
      updatedCount = toUpdate.length;
    }

    let createdCount = 0;
    if (toCreateDtos.length > 0) {
      const reservedSlugs = new Set(
        (
          await this.prisma.product.findMany({
            where: { deletedAt: null },
            select: { slug: true },
          })
        ).map((p) => p.slug),
      );

      const data = toCreateDtos.map(({ dto, sku, index }) => {
        const name = String(dto.name ?? '').trim();
        if (!name) {
          throw new BadRequestException(
            `Product at row ${index + 1} requires a name.`,
          );
        }

        let baseSlug = dto.slug?.trim()
          ? this.normalizeSlug(dto.slug)
          : this.normalizeSlug(name);
        if (!baseSlug) {
          baseSlug = `product-${index + 1}`;
        }

        let slug = baseSlug;
        let counter = 1;
        while (reservedSlugs.has(slug)) {
          slug = `${baseSlug}-${counter}`;
          counter += 1;
        }
        reservedSlugs.add(slug);

        return {
          sku,
          name,
          slug,
          type: dto.type,
          description: dto.description ?? null,
          shortDescription: dto.shortDescription ?? null,
          seoTitle: dto.seoTitle ?? null,
          metaDescription: dto.metaDescription ?? null,
          tasteProfile: dto.tasteProfile ?? null,
          ingredients: dto.ingredients ?? null,
          servingSuggestions: dto.servingSuggestions ?? null,
          storageInstructions: dto.storageInstructions ?? null,
          dietaryHighlights: dto.dietaryHighlights ?? null,
          spiceLevel: dto.spiceLevel ?? null,
          faqs: dto.faqs ?? null,
          focusKeywords: dto.focusKeywords ?? null,
          productTags: dto.productTags ?? null,
          basePrice: dto.basePrice,
          cost: dto.cost ?? null,
          weight: dto.weight ?? null,
          ...(dto.shippingWeight !== undefined
            ? { shippingWeight: dto.shippingWeight }
            : {}),
          ...(dto.shippingWeightUnit !== undefined
            ? {
                shippingWeightUnit: normalizeShippingWeightUnit(
                  dto.shippingWeightUnit,
                ),
              }
            : {}),
          status: dto.status || ProductStatus.DRAFT,
          visibility: dto.visibility || 'both',
          taxClassId: dto.taxClassId ?? null,
          attributes: dto.attributes || {},
          metaData: dto.metaData || {},
        };
      });

      const result = await this.prisma.product.createMany({ data });
      createdCount = result.count;
    }

    return {
      createdCount,
      updatedCount,
      requestedCount: dtos.length,
    };
  }

  /** Content/SEO fields applied when bulk-uploading an existing SKU. */
  private buildBulkContentUpdate(dto: CreateProductDto) {
    const data: Record<string, string | null> = {};
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.shortDescription !== undefined) {
      data.shortDescription = dto.shortDescription;
    }
    if (dto.seoTitle !== undefined) data.seoTitle = dto.seoTitle;
    if (dto.metaDescription !== undefined) {
      data.metaDescription = dto.metaDescription;
    }
    if (dto.tasteProfile !== undefined) data.tasteProfile = dto.tasteProfile;
    if (dto.ingredients !== undefined) data.ingredients = dto.ingredients;
    if (dto.servingSuggestions !== undefined) {
      data.servingSuggestions = dto.servingSuggestions;
    }
    if (dto.storageInstructions !== undefined) {
      data.storageInstructions = dto.storageInstructions;
    }
    if (dto.dietaryHighlights !== undefined) {
      data.dietaryHighlights = dto.dietaryHighlights;
    }
    if (dto.spiceLevel !== undefined) data.spiceLevel = dto.spiceLevel;
    if (dto.focusKeywords !== undefined) data.focusKeywords = dto.focusKeywords;
    if (dto.productTags !== undefined) data.productTags = dto.productTags;
    return data;
  }

  async findAll(query: ProductQueryDto) {
    const merged = ProductQuery.mergeEffectiveQuery(query);
    const q = await expandCategoryFilterWithDescendants(this.prisma, merged);
    const where = ProductQuery.buildWhereClause(q);
    const include = ProductQuery.buildIncludeClause();
    const { skip, take, page } = ProductQuery.buildPaginationParams(query);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getFacets(query: ProductQueryDto) {
    return ProductFacetAggregate.compute(this.prisma, query);
  }

  async findAllAdmin(query: AdminProductListQueryDto) {
    const where = ProductQuery.buildAdminWhereClause(query);
    const include = ProductQuery.buildAdminListInclude();
    const { skip, take, page } = ProductQuery.buildPaginationParams(
      query as ProductQueryDto,
    );

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Lightweight search for suggestions (dropdown). Returns minimal fields; limit 2–20.
   */
  async findSearchSuggestions(q: string, limit = 8) {
    const searchTerm = typeof q === 'string' ? q.trim() : '';
    const take = Math.min(20, Math.max(2, Math.floor(Number(limit)) || 8));
    if (searchTerm.length < 2) {
      return { data: [], total: 0 };
    }
    const where = ProductQuery.buildWhereClause(
      ProductQuery.mergeEffectiveQuery({
        search: searchTerm,
      } as ProductQueryDto),
    );
    const products = await this.prisma.product.findMany({
      where,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        basePrice: true,
        images: {
          take: 1,
          orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
          select: { url: true },
        },
      },
    });
    const total =
      searchTerm.length >= 2 ? await this.prisma.product.count({ where }) : 0;
    return { data: products, total };
  }

  async findOneBySlug(slug: string) {
    const normalized = slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const product = await this.prisma.product.findFirst({
      where: {
        slug: normalized,
        status: 'active',
        deletedAt: null,
      },
      include: ProductQuery.buildIncludeClause(),
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async findOneById(id: string, includeDeleted = false) {
    const where: any = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const product = await this.prisma.product.findFirst({
      where,
      include: ProductQuery.buildAdminProductDetailInclude(),
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOneById(id);

    if (updateProductDto.sku) {
      await this.validateSkuUniqueness(updateProductDto.sku, id);
    }

    const updateData: any = {};

    if (updateProductDto.name) {
      updateData.name = updateProductDto.name;
      if (!updateProductDto.slug) {
        updateData.slug = await this.generateSlug(updateProductDto.name, id);
      }
    }

    if (updateProductDto.slug) {
      updateData.slug = this.normalizeSlug(updateProductDto.slug);
    }

    if (updateProductDto.sku) {
      updateData.sku = updateProductDto.sku;
    }

    if (updateProductDto.type !== undefined) {
      updateData.type = updateProductDto.type;
    }

    if (updateProductDto.description !== undefined) {
      updateData.description = updateProductDto.description;
    }

    if (updateProductDto.shortDescription !== undefined) {
      updateData.shortDescription = updateProductDto.shortDescription;
    }

    if (updateProductDto.seoTitle !== undefined) {
      updateData.seoTitle = updateProductDto.seoTitle;
    }

    if (updateProductDto.metaDescription !== undefined) {
      updateData.metaDescription = updateProductDto.metaDescription;
    }

    if (updateProductDto.tasteProfile !== undefined) {
      updateData.tasteProfile = updateProductDto.tasteProfile;
    }

    if (updateProductDto.ingredients !== undefined) {
      updateData.ingredients = updateProductDto.ingredients;
    }

    if (updateProductDto.servingSuggestions !== undefined) {
      updateData.servingSuggestions = updateProductDto.servingSuggestions;
    }

    if (updateProductDto.storageInstructions !== undefined) {
      updateData.storageInstructions = updateProductDto.storageInstructions;
    }

    if (updateProductDto.dietaryHighlights !== undefined) {
      updateData.dietaryHighlights = updateProductDto.dietaryHighlights;
    }

    if (updateProductDto.spiceLevel !== undefined) {
      updateData.spiceLevel = updateProductDto.spiceLevel;
    }

    if (updateProductDto.faqs !== undefined) {
      updateData.faqs = updateProductDto.faqs;
    }

    if (updateProductDto.focusKeywords !== undefined) {
      updateData.focusKeywords = updateProductDto.focusKeywords;
    }

    if (updateProductDto.productTags !== undefined) {
      updateData.productTags = updateProductDto.productTags;
    }

    if (updateProductDto.basePrice !== undefined) {
      updateData.basePrice = updateProductDto.basePrice;
    }

    if (updateProductDto.cost !== undefined) {
      updateData.cost = updateProductDto.cost;
    }

    if (updateProductDto.weight !== undefined) {
      updateData.weight = updateProductDto.weight;
    }

    if (updateProductDto.shippingWeight !== undefined) {
      updateData.shippingWeight = updateProductDto.shippingWeight;
    }

    if (updateProductDto.shippingWeightUnit !== undefined) {
      updateData.shippingWeightUnit = normalizeShippingWeightUnit(
        updateProductDto.shippingWeightUnit,
      );
    }

    if (updateProductDto.status !== undefined) {
      updateData.status = updateProductDto.status;
    }

    if (updateProductDto.visibility !== undefined) {
      updateData.visibility = updateProductDto.visibility;
    }

    if (updateProductDto.taxClassId !== undefined) {
      updateData.taxClassId = updateProductDto.taxClassId;
    }

    if (updateProductDto.attributes !== undefined) {
      updateData.attributes = updateProductDto.attributes;
    }

    if (updateProductDto.metaData !== undefined) {
      updateData.metaData = updateProductDto.metaData;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: ProductQuery.buildAdminProductDetailInclude(),
    });

    return product;
  }

  async remove(id: string) {
    await this.findOneById(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return product;
  }

  /**
   * Soft-delete many products in one update (sets deletedAt).
   * Already-archived IDs are ignored (deletedAt IS NULL filter).
   */
  async removeMany(ids: string[]) {
    const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
    if (uniqueIds.length === 0) {
      return { deletedCount: 0, ids: [] as string[] };
    }

    const result = await this.prisma.product.updateMany({
      where: {
        id: { in: uniqueIds },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      deletedCount: result.count,
      ids: uniqueIds,
    };
  }

  async assignCategory(productId: string, categoryId: string, position = 0) {
    await this.findOneById(productId);

    const productCategory = await this.prisma.productCategory.upsert({
      where: {
        productId_categoryId: {
          productId,
          categoryId,
        },
      },
      create: {
        productId,
        categoryId,
        position,
      },
      update: {
        position,
      },
    });

    return productCategory;
  }

  async removeCategoryFromProduct(productId: string, categoryId: string) {
    await this.findOneById(productId);

    const relation = await this.prisma.productCategory.findUnique({
      where: {
        productId_categoryId: {
          productId,
          categoryId,
        },
      },
      select: { productId: true },
    });

    if (!relation) {
      throw new NotFoundException(
        `Category ${categoryId} is not assigned to product ${productId}`,
      );
    }

    await this.prisma.productCategory.delete({
      where: {
        productId_categoryId: {
          productId,
          categoryId,
        },
      },
    });
  }
}

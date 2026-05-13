import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateProductDto, ProductStatus } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQuery, expandCategoryFilterWithDescendants } from '../queries/product.query';
import { ProductQueryDto } from '../dto/product-query.dto';
import { ProductFacetAggregate } from '../queries/product-facet-aggregate';
import { AdminProductListQueryDto } from '../dto/admin-product-list-query.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async generateSlug(name: string, existingId?: string): Promise<string> {
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

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

  async validateSkuUniqueness(sku: string, excludeProductId?: string): Promise<void> {
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

    const slug =
      createProductDto.slug ||
      (await this.generateSlug(createProductDto.name));

    const product = await this.prisma.product.create({
      data: {
        sku: createProductDto.sku,
        name: createProductDto.name,
        slug,
        type: createProductDto.type,
        description: createProductDto.description,
        shortDescription: createProductDto.shortDescription,
        basePrice: createProductDto.basePrice,
        cost: createProductDto.cost,
        weight: createProductDto.weight,
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
    const { skip, take, page } = ProductQuery.buildPaginationParams(query as ProductQueryDto);

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
    const where = ProductQuery.buildWhereClause(ProductQuery.mergeEffectiveQuery({ search: searchTerm } as ProductQueryDto));
    const products = await this.prisma.product.findMany({
      where,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
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
    const total = searchTerm.length >= 2 ? await this.prisma.product.count({ where }) : 0;
    return { data: products, total };
  }

  async findOneBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
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
      updateData.slug = updateProductDto.slug;
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

    if (updateProductDto.basePrice !== undefined) {
      updateData.basePrice = updateProductDto.basePrice;
    }

    if (updateProductDto.cost !== undefined) {
      updateData.cost = updateProductDto.cost;
    }

    if (updateProductDto.weight !== undefined) {
      updateData.weight = updateProductDto.weight;
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


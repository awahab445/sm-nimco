import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  bannerUrl: true,
  parentId: true,
  position: true,
  isActive: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateSlug(
    name: string,
    existingId?: string,
  ): Promise<string> {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    let slug = base;
    let n = 1;
    while (true) {
      const existing = await this.prisma.category.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!existing || (existingId && existing.id === existingId)) return slug;
      slug = `${base}-${n}`;
      n++;
    }
  }

  /**
   * List categories (flat or tree). Storefront uses active only; admin can include inactive.
   */
  async findAll(options?: {
    parentId?: string | null;
    tree?: boolean;
    includeInactive?: boolean;
    featured?: boolean;
  }) {
    const where: {
      isActive?: boolean;
      isFeatured?: boolean;
      parentId?: string | null;
    } = {};
    if (!options?.includeInactive) {
      where.isActive = true;
    }
    if (options?.featured) {
      where.isFeatured = true;
    }
    if (options?.parentId !== undefined) {
      where.parentId = options.parentId;
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        bannerUrl: true,
        parentId: true,
        position: true,
        isActive: true,
        isFeatured: true,
      },
    });

    const withCount = await Promise.all(
      categories.map(async (c) => {
        const productCount = await this.prisma.productCategory.count({
          where: { categoryId: c.id },
        });
        return { ...c, productCount };
      }),
    );

    if (options?.tree) {
      return this.buildTree(withCount, null);
    }
    return { data: withCount };
  }

  private buildTree(
    flat: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      imageUrl: string | null;
      bannerUrl: string | null;
      parentId: string | null;
      position: number;
      isActive: boolean;
      isFeatured: boolean;
      productCount: number;
    }>,
    parentId: string | null,
  ): any[] {
    return flat
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        ...c,
        children: this.buildTree(flat, c.id),
      }));
  }

  /**
   * Get one category by slug (for storefront category page).
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug, isActive: true },
      select: categorySelect,
    });
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    const productCount = await this.prisma.productCategory.count({
      where: { categoryId: category.id },
    });
    return { ...category, productCount };
  }

  /**
   * Get one category by id.
   */
  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: categorySelect,
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  /**
   * List products mapped to a category (admin).
   */
  async getProducts(categoryId: string) {
    await this.findById(categoryId);
    const rows = await this.prisma.productCategory.findMany({
      where: { categoryId },
      orderBy: [{ position: 'asc' }, { productId: 'asc' }],
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
            status: true,
          },
        },
      },
    });
    return {
      data: rows.map((r) => ({
        ...r.product,
        position: r.position,
      })),
    };
  }

  /**
   * Replace the full product mapping for a category (admin).
   */
  async syncProducts(categoryId: string, productIds: string[]) {
    await this.findById(categoryId);
    const uniqueIds = [...new Set(productIds)];

    if (uniqueIds.length > 0) {
      const found = await this.prisma.product.findMany({
        where: { id: { in: uniqueIds }, deletedAt: null },
        select: { id: true },
      });
      const foundIds = new Set(found.map((p) => p.id));
      const missing = uniqueIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new NotFoundException(
          `Products not found: ${missing.join(', ')}`,
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      const current = await tx.productCategory.findMany({
        where: { categoryId },
        select: { productId: true },
      });
      const currentIds = new Set(current.map((c) => c.productId));
      const newIds = new Set(uniqueIds);

      const toRemove = [...currentIds].filter((id) => !newIds.has(id));
      if (toRemove.length > 0) {
        await tx.productCategory.deleteMany({
          where: { categoryId, productId: { in: toRemove } },
        });
      }

      const toAdd = uniqueIds.filter((id) => !currentIds.has(id));
      for (let i = 0; i < toAdd.length; i++) {
        await tx.productCategory.create({
          data: { categoryId, productId: toAdd[i], position: i },
        });
      }
    });

    return this.getProducts(categoryId);
  }

  async create(data: {
    name: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    bannerUrl?: string;
    parentId?: string;
    position?: number;
    isFeatured?: boolean;
  }) {
    const slug = data.slug || (await this.generateSlug(data.name));
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing)
      throw new ConflictException(`Category with slug ${slug} already exists`);
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        imageUrl: data.imageUrl?.trim() || null,
        bannerUrl: data.bannerUrl?.trim() || null,
        parentId: data.parentId ?? null,
        position: data.position ?? 0,
        isFeatured: data.isFeatured ?? false,
      },
      select: categorySelect,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      imageUrl?: string | null;
      bannerUrl?: string | null;
      parentId?: string | null;
      position?: number;
      isActive?: boolean;
      isFeatured?: boolean;
    },
  ) {
    await this.findById(id);
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    else if (data.name)
      updateData.slug = await this.generateSlug(data.name, id);
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.imageUrl !== undefined)
      updateData.imageUrl = data.imageUrl?.trim() || null;
    if (data.bannerUrl !== undefined)
      updateData.bannerUrl = data.bannerUrl?.trim() || null;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    return this.prisma.category.update({
      where: { id },
      data: updateData,
      select: categorySelect,
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });
    await this.prisma.productCategory.deleteMany({ where: { categoryId: id } });
    return this.prisma.category.delete({
      where: { id },
      select: categorySelect,
    });
  }
}

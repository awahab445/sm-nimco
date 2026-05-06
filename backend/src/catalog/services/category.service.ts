import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateSlug(name: string, existingId?: string): Promise<string> {
    let base = name
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
  }) {
    const where: { isActive?: boolean; parentId?: string | null } = {};
    if (!options?.includeInactive) {
      where.isActive = true;
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
        parentId: true,
        position: true,
        isActive: true,
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
      parentId: string | null;
      position: number;
      isActive: boolean;
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
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async create(data: { name: string; slug?: string; description?: string; parentId?: string; position?: number }) {
    const slug = data.slug || (await this.generateSlug(data.name));
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`Category with slug ${slug} already exists`);
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        position: data.position ?? 0,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: string | null;
      position?: number;
      isActive?: boolean;
    },
  ) {
    await this.findById(id);
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    else if (data.name) updateData.slug = await this.generateSlug(data.name, id);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    return this.prisma.category.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.category.updateMany({ where: { parentId: id }, data: { parentId: null } });
    await this.prisma.productCategory.deleteMany({ where: { categoryId: id } });
    return this.prisma.category.delete({ where: { id } });
  }
}

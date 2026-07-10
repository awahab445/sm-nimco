import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateStorefrontFilterDto } from '../dto/create-storefront-filter.dto';
import { UpdateStorefrontFilterDto } from '../dto/update-storefront-filter.dto';
import { CreateStorefrontFilterOptionDto } from '../dto/create-storefront-filter-option.dto';
import { UpdateStorefrontFilterOptionDto } from '../dto/update-storefront-filter-option.dto';
import {
  ReorderFilterBrowseTreeDto,
  UpdateFilterBrowseTreeNodeDto,
} from '../dto/filter-browse-tree.dto';

export type PlpBrowseTreeNode = {
  id: string;
  label: string;
  href: string;
  categoryId: string | null;
  sortOrder: number;
  children: PlpBrowseTreeNode[];
};

type TreeRow = {
  id: string;
  filterId: string;
  parentId: string | null;
  navLinkId: string | null;
  sortOrder: number;
  isActive: boolean;
  navLink?: {
    label: string;
    href: string;
    categoryId: string | null;
    isActive: boolean;
    category?: { id: string; slug: string; name: string } | null;
  } | null;
};

@Injectable()
export class StorefrontFilterService {
  constructor(private readonly prisma: PrismaService) {}

  /** Models appear on PrismaClient after `npx prisma generate` (restart backend if locked on Windows). */
  private get db(): any {
    return this.prisma;
  }

  async listAllForAdmin() {
    return this.db.storefrontFilter.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      include: {
        options: { orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }] },
      },
    });
  }

  private async assertUniqueKind(
    kind: string,
    excludeId?: string,
  ): Promise<void> {
    if (kind === 'CATEGORY' || kind === 'PRICE') {
      const existing = await this.db.storefrontFilter.findFirst({
        where: { kind, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      });
      if (existing) {
        throw new ConflictException(
          `A ${kind} filter already exists. Only one ${kind} filter is allowed.`,
        );
      }
    }
  }

  async createFilter(dto: CreateStorefrontFilterDto) {
    await this.assertUniqueKind(dto.kind);
    const code = dto.code.trim();
    const name = dto.name.trim();
    try {
      return await this.db.storefrontFilter.create({
        data: {
          code,
          name,
          kind: dto.kind,
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
        include: { options: true },
      });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException(`Filter code "${code}" is already in use.`);
      }
      throw e;
    }
  }

  async updateFilter(id: string, dto: UpdateStorefrontFilterDto) {
    const row = await this.db.storefrontFilter.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Filter not found');

    if (dto.code != null && dto.code.trim() !== row.code) {
      const taken = await this.db.storefrontFilter.findFirst({
        where: { code: dto.code.trim(), NOT: { id } },
      });
      if (taken)
        throw new ConflictException(
          `Code "${dto.code.trim()}" is already in use.`,
        );
    }

    try {
      return await this.db.storefrontFilter.update({
        where: { id },
        data: {
          ...(dto.code !== undefined ? { code: dto.code.trim() } : {}),
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
        include: {
          options: { orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }] },
        },
      });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException('That filter code is already in use.');
      }
      throw e;
    }
  }

  async deleteFilter(id: string) {
    const row = await this.db.storefrontFilter.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Filter not found');
    await this.db.storefrontFilter.delete({ where: { id } });
    return { id };
  }

  async createOption(filterId: string, dto: CreateStorefrontFilterOptionDto) {
    const filter = await this.db.storefrontFilter.findUnique({
      where: { id: filterId },
    });
    if (!filter) throw new NotFoundException('Filter not found');
    if (filter.kind !== 'ATTRIBUTE') {
      throw new BadRequestException(
        'Options can only be added to ATTRIBUTE filters.',
      );
    }
    const value = dto.value.trim();
    if (!value) throw new BadRequestException('value is required');
    try {
      return await this.db.storefrontFilterOption.create({
        data: {
          filterId,
          value,
          label: dto.label?.trim() || null,
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `Option value "${value}" already exists for this filter.`,
        );
      }
      throw e;
    }
  }

  async updateOption(optionId: string, dto: UpdateStorefrontFilterOptionDto) {
    const opt = await this.db.storefrontFilterOption.findUnique({
      where: { id: optionId },
      include: { filter: true },
    });
    if (!opt) throw new NotFoundException('Option not found');
    const nextVal = dto.value !== undefined ? dto.value.trim() : opt.value;
    if (dto.value !== undefined && !nextVal)
      throw new BadRequestException('value cannot be empty');
    try {
      return await this.db.storefrontFilterOption.update({
        where: { id: optionId },
        data: {
          ...(dto.value !== undefined ? { value: nextVal } : {}),
          ...(dto.label !== undefined
            ? { label: dto.label?.trim() || null }
            : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          'That option value already exists for this filter.',
        );
      }
      throw e;
    }
  }

  async deleteOption(optionId: string) {
    const opt = await this.db.storefrontFilterOption.findUnique({
      where: { id: optionId },
    });
    if (!opt) throw new NotFoundException('Option not found');
    await this.db.storefrontFilterOption.delete({ where: { id: optionId } });
    return { id: optionId };
  }

  private resolveNavHref(nav: {
    href: string;
    category?: { slug: string } | null;
  }): string {
    if (nav.category?.slug) return `/categories/${nav.category.slug}`;
    const h = nav.href?.trim();
    return h || '/products';
  }

  private slugFromHref(href: string): string | null {
    const m = href.trim().match(/\/categories\/([^/?#]+)/i);
    return m?.[1] ?? null;
  }

  private resolveCategoryId(
    nav:
      | {
          categoryId?: string | null;
          href?: string;
          category?: { id?: string; slug?: string } | null;
        }
      | null
      | undefined,
    slugToId: Map<string, string>,
  ): string | null {
    if (!nav) return null;
    if (nav.categoryId) return nav.categoryId;
    if (nav.category?.id) return nav.category.id;
    const slug = nav.category?.slug ?? this.slugFromHref(nav.href ?? '');
    if (slug && slugToId.has(slug)) return slugToId.get(slug)!;
    return null;
  }

  private buildBrowseTree(
    flat: TreeRow[],
    slugToId: Map<string, string>,
  ): PlpBrowseTreeNode[] {
    const byParent = new Map<string | null, TreeRow[]>();
    for (const row of flat) {
      const key = row.parentId;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(row);
    }
    for (const list of byParent.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const walk = (parentId: string | null): PlpBrowseTreeNode[] =>
      (byParent.get(parentId) ?? []).map((row) => {
        const nav = row.navLink;
        const label = nav?.label?.trim() || 'Item';
        const href = nav ? this.resolveNavHref(nav) : '/products';
        const categoryId = this.resolveCategoryId(nav, slugToId);
        return {
          id: row.id,
          label,
          href,
          categoryId,
          sortOrder: row.sortOrder,
          children: walk(row.id),
        };
      });

    return walk(null);
  }

  private async getCategoryFilterOrThrow(filterId: string) {
    const filter = await this.db.storefrontFilter.findUnique({
      where: { id: filterId },
    });
    if (!filter) throw new NotFoundException('Filter not found');
    if (filter.kind !== 'CATEGORY') {
      throw new BadRequestException(
        'Browse tree is only available for CATEGORY filters.',
      );
    }
    return filter;
  }

  async listBrowseTreeForAdmin(filterId: string) {
    await this.getCategoryFilterOrThrow(filterId);
    return this.db.storefrontFilterTreeNode.findMany({
      where: { filterId },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        navLink: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  async findPublicBrowseTree(): Promise<{
    label: string;
    tree: PlpBrowseTreeNode[];
  } | null> {
    const filter = await this.db.storefrontFilter.findFirst({
      where: { kind: 'CATEGORY', isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (!filter) return null;

    const rows = await this.db.storefrontFilterTreeNode.findMany({
      where: { filterId: filter.id, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        navLink: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    const slugToId = new Map<string, string>();
    for (const r of rows as TreeRow[]) {
      const nav = r.navLink;
      if (!nav) continue;
      if (nav.category?.id && nav.category.slug)
        slugToId.set(nav.category.slug, nav.category.id);
      const slug = this.slugFromHref(nav.href ?? '');
      if (slug && nav.categoryId) slugToId.set(slug, nav.categoryId);
    }
    const missingSlugs = new Set<string>();
    for (const r of rows as TreeRow[]) {
      const nav = r.navLink;
      if (!nav || this.resolveCategoryId(nav, slugToId)) continue;
      const slug = nav.category?.slug ?? this.slugFromHref(nav.href ?? '');
      if (slug) missingSlugs.add(slug);
    }
    if (missingSlugs.size > 0) {
      const cats = await this.db.category.findMany({
        where: { slug: { in: [...missingSlugs] }, isActive: true },
        select: { id: true, slug: true },
      });
      for (const c of cats) slugToId.set(c.slug, c.id);
    }

    const activeRows = rows.filter(
      (r: TreeRow) => r.navLink?.isActive !== false,
    ) as TreeRow[];
    if (activeRows.length === 0) {
      return { label: filter.name, tree: [] };
    }
    return {
      label: filter.name,
      tree: this.buildBrowseTree(activeRows, slugToId),
    };
  }

  async syncBrowseTreeFromNavigation(filterId: string) {
    await this.getCategoryFilterOrThrow(filterId);

    const navLinks = await this.db.storefrontNavLink.findMany({
      where: { zone: 'mega' },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });

    await this.db.$transaction(async (tx: any) => {
      const existing = await tx.storefrontFilterTreeNode.findMany({
        where: { filterId },
      });
      const byNavId = new Map<string, { id: string }>();
      for (const row of existing) {
        if (row.navLinkId) byNavId.set(row.navLinkId, row);
      }

      const navIdToTreeId = new Map<string, string>();

      for (const nav of navLinks.filter(
        (n: { parentId: string | null }) => !n.parentId,
      )) {
        const prev = byNavId.get(nav.id);
        const node = prev
          ? await tx.storefrontFilterTreeNode.update({
              where: { id: prev.id },
              data: { sortOrder: nav.sortOrder, parentId: null },
            })
          : await tx.storefrontFilterTreeNode.create({
              data: {
                filterId,
                navLinkId: nav.id,
                parentId: null,
                sortOrder: nav.sortOrder,
                isActive: nav.isActive,
              },
            });
        navIdToTreeId.set(nav.id, node.id);
      }

      for (const nav of navLinks.filter(
        (n: { parentId: string | null }) => n.parentId,
      )) {
        const parentTreeId = navIdToTreeId.get(nav.parentId);
        if (!parentTreeId) continue;
        const prev = byNavId.get(nav.id);
        const node = prev
          ? await tx.storefrontFilterTreeNode.update({
              where: { id: prev.id },
              data: { sortOrder: nav.sortOrder, parentId: parentTreeId },
            })
          : await tx.storefrontFilterTreeNode.create({
              data: {
                filterId,
                navLinkId: nav.id,
                parentId: parentTreeId,
                sortOrder: nav.sortOrder,
                isActive: nav.isActive,
              },
            });
        navIdToTreeId.set(nav.id, node.id);
      }

      const validNavIds = new Set(navLinks.map((n: { id: string }) => n.id));
      const stale = existing.filter(
        (r: { navLinkId: string | null }) =>
          r.navLinkId && !validNavIds.has(r.navLinkId),
      );
      if (stale.length) {
        await tx.storefrontFilterTreeNode.deleteMany({
          where: { id: { in: stale.map((s: { id: string }) => s.id) } },
        });
      }
    });

    return this.listBrowseTreeForAdmin(filterId);
  }

  async updateBrowseTreeNode(
    nodeId: string,
    dto: UpdateFilterBrowseTreeNodeDto,
  ) {
    const row = await this.db.storefrontFilterTreeNode.findUnique({
      where: { id: nodeId },
    });
    if (!row) throw new NotFoundException('Browse tree node not found');
    if (dto.parentId !== undefined && dto.parentId === nodeId) {
      throw new BadRequestException('A node cannot be its own parent.');
    }
    return this.db.storefrontFilterTreeNode.update({
      where: { id: nodeId },
      data: {
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
      },
      include: {
        navLink: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  async reorderBrowseTree(dto: ReorderFilterBrowseTreeDto) {
    await this.db.$transaction(
      dto.items.map((item) =>
        this.db.storefrontFilterTreeNode.update({
          where: { id: item.id },
          data: {
            parentId: item.parentId ?? null,
            sortOrder: item.sortOrder,
          },
        }),
      ),
    );
    return { ok: true };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
import {
  CreateStorefrontNavLinkDto,
  ReorderStorefrontNavDto,
} from '../dto/create-storefront-nav-link.dto';
import { UpdateStorefrontNavLinkDto } from '../dto/update-storefront-nav-link.dto';

export type StorefrontNavMegaNode = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  children: StorefrontNavMegaNode[];
};

export type StorefrontNavHeaderPublic = {
  id: string;
  label: string;
  secondaryLabel: string | null;
  href: string;
  sortOrder: number;
  openMegaMenu: boolean;
  bannerImageUrl: string | null;
  bannerHref: string | null;
  bannerAlt: string | null;
};

export type StorefrontNavPublicPayload = {
  header: StorefrontNavHeaderPublic[];
  megaMenu: StorefrontNavMegaNode[];
};

type NavRow = {
  id: string;
  label: string;
  secondaryLabel: string | null;
  href: string;
  sortOrder: number;
  isActive: boolean;
  kind: string;
  zone: string;
  parentId: string | null;
  categoryId: string | null;
  openMegaMenu: boolean;
  bannerImageUrl: string | null;
  bannerHref: string | null;
  bannerAlt: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: { slug: string; name: string } | null;
};

const STOREFRONT_RESERVED_CMS_SLUGS = new Set(
  [
    'account',
    'addresses',
    'api',
    'cart',
    'categories',
    'checkout',
    'create-password',
    'login',
    'logout',
    'orders',
    'pages',
    'products',
    'profile',
    'register',
    'track-order',
    'shipping-returns',
    'privacy-policy',
    'terms-conditions',
  ].map((s) => s.toLowerCase()),
);

@Injectable()
export class StorefrontNavService {
  constructor(private readonly prisma: PrismaService) {}

  private async runNavQuery<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2021'
      ) {
        throw new ServiceUnavailableException(
          'Store navigation is not available: apply storefront nav migrations.',
        );
      }
      throw e;
    }
  }

  private normalizeHref(href: string): string {
    const h = href.trim().split('?')[0]?.split('#')[0] ?? '/';
    if (h.length > 1 && h.endsWith('/')) return h.slice(0, -1);
    return h || '/';
  }

  private cmsPageHref(slug: string): string {
    const s = slug.trim();
    if (!s) return '/';
    return `/${encodeURIComponent(s)}`;
  }

  private async appendPublishedCmsPages(
    header: StorefrontNavHeaderPublic[],
  ): Promise<StorefrontNavHeaderPublic[]> {
    const cmsPages = await this.prisma.cmsPage.findMany({
      where: { status: 'published' },
      orderBy: [{ title: 'asc' }],
      select: { id: true, title: true, slug: true },
    });

    const existingHrefs = new Set(
      header.map((item) => this.normalizeHref(item.href)),
    );
    const cmsNavItems: StorefrontNavHeaderPublic[] = [];

    for (const page of cmsPages) {
      const slug = page.slug?.trim();
      if (!slug || STOREFRONT_RESERVED_CMS_SLUGS.has(slug.toLowerCase()))
        continue;

      const href = this.cmsPageHref(slug);
      if (existingHrefs.has(this.normalizeHref(href))) continue;

      cmsNavItems.push({
        id: `cms:${page.id}`,
        label: page.title.trim() || slug,
        secondaryLabel: null,
        href,
        sortOrder: 0,
        openMegaMenu: false,
        bannerImageUrl: null,
        bannerHref: null,
        bannerAlt: null,
      });
      existingHrefs.add(this.normalizeHref(href));
    }

    if (cmsNavItems.length === 0) return header;

    const cartIndex = header.findIndex(
      (item) => this.normalizeHref(item.href) === '/cart',
    );
    const insertAt = cartIndex >= 0 ? cartIndex : header.length;
    const before = header.slice(0, insertAt);
    const after = header.slice(insertAt);

    const baseSortOrder =
      before.length > 0
        ? Math.max(...before.map((item) => item.sortOrder)) + 1
        : 25;

    const positionedCmsItems = cmsNavItems.map((item, index) => ({
      ...item,
      sortOrder: baseSortOrder + index,
    }));

    return [...before, ...positionedCmsItems, ...after];
  }

  private resolveHref(row: {
    href: string;
    category?: { slug: string } | null;
  }): string {
    if (row.category?.slug) return `/categories/${row.category.slug}`;
    const h = row.href?.trim();
    return h || '/';
  }

  private buildMegaTree(flat: NavRow[]): StorefrontNavMegaNode[] {
    const byParent = new Map<string | null, NavRow[]>();
    for (const row of flat) {
      const key = row.parentId;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(row);
    }
    for (const list of byParent.values()) {
      list.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
      );
    }

    const walk = (parentId: string | null): StorefrontNavMegaNode[] =>
      (byParent.get(parentId) ?? []).map((row) => ({
        id: row.id,
        label: row.label,
        href: this.resolveHref(row),
        sortOrder: row.sortOrder,
        children: walk(row.id),
      }));

    return walk(null);
  }

  private async validateParent(
    parentId: string | null,
    zone: string,
    excludeId?: string,
  ): Promise<void> {
    if (!parentId) return;
    if (parentId === excludeId) {
      throw new BadRequestException('A menu item cannot be its own parent.');
    }
    const parent = await this.runNavQuery(() =>
      this.prisma.storefrontNavLink.findUnique({ where: { id: parentId } }),
    );
    if (!parent) throw new BadRequestException('Parent menu item not found.');
    if (parent.zone !== zone) {
      throw new BadRequestException(
        'Parent must be in the same navigation zone.',
      );
    }
    if (zone === 'header' && parent.parentId) {
      throw new BadRequestException('Header links cannot be nested.');
    }
  }

  private async validateCategory(categoryId: string | null): Promise<void> {
    if (!categoryId) return;
    const cat = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!cat) throw new BadRequestException('Linked category not found.');
  }

  async findPublic(): Promise<StorefrontNavPublicPayload> {
    const rows = await this.runNavQuery(() =>
      this.prisma.storefrontNavLink.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
        include: { category: { select: { slug: true, name: true } } },
      }),
    );

    const header = rows
      .filter((r) => r.zone === 'header' && !r.parentId)
      .map((r) => ({
        id: r.id,
        label: r.label,
        secondaryLabel: r.secondaryLabel,
        href: this.resolveHref(r),
        sortOrder: r.sortOrder,
        openMegaMenu: r.openMegaMenu || r.kind === 'MEGA_CATEGORIES',
        bannerImageUrl: r.bannerImageUrl?.trim() || null,
        bannerHref: r.bannerHref?.trim() || null,
        bannerAlt: r.bannerAlt?.trim() || null,
      }));

    const megaFlat = rows.filter((r) => r.zone === 'mega') as NavRow[];
    const headerWithCms = await this.appendPublishedCmsPages(header);
    return { header: headerWithCms, megaMenu: this.buildMegaTree(megaFlat) };
  }

  async listAllForAdmin() {
    return this.runNavQuery(() =>
      this.prisma.storefrontNavLink.findMany({
        orderBy: [{ zone: 'asc' }, { sortOrder: 'asc' }, { label: 'asc' }],
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
    );
  }

  async create(dto: CreateStorefrontNavLinkDto) {
    const zone = dto.zone ?? 'header';
    const parentId = dto.parentId ?? null;
    if (zone === 'header' && parentId) {
      throw new BadRequestException('Header bar links cannot have a parent.');
    }
    await this.validateParent(parentId, zone);
    await this.validateCategory(dto.categoryId ?? null);

    return this.runNavQuery(() =>
      this.prisma.storefrontNavLink.create({
        data: {
          label: dto.label.trim(),
          secondaryLabel: dto.secondaryLabel?.trim() || null,
          href: dto.href?.trim() ?? '',
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
          kind: dto.kind ?? 'LINK',
          zone,
          parentId,
          categoryId: dto.categoryId ?? null,
          openMegaMenu: dto.openMegaMenu ?? false,
          bannerImageUrl: dto.bannerImageUrl?.trim() || null,
          bannerHref: dto.bannerHref?.trim() || null,
          bannerAlt: dto.bannerAlt?.trim() || null,
        },
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
    );
  }

  async update(id: string, dto: UpdateStorefrontNavLinkDto) {
    const row = await this.runNavQuery(() =>
      this.prisma.storefrontNavLink.findUnique({ where: { id } }),
    );
    if (!row) throw new NotFoundException('Nav link not found');

    const zone = dto.zone ?? row.zone;
    const parentId = dto.parentId !== undefined ? dto.parentId : row.parentId;
    if (zone === 'header' && parentId) {
      throw new BadRequestException('Header bar links cannot have a parent.');
    }
    await this.validateParent(parentId, zone, id);
    if (dto.categoryId !== undefined)
      await this.validateCategory(dto.categoryId);

    return this.runNavQuery(() =>
      this.prisma.storefrontNavLink.update({
        where: { id },
        data: {
          ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
          ...(dto.secondaryLabel !== undefined
            ? {
                secondaryLabel:
                  dto.secondaryLabel === null
                    ? null
                    : dto.secondaryLabel.trim() || null,
              }
            : {}),
          ...(dto.href !== undefined ? { href: dto.href.trim() } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
          ...(dto.kind !== undefined ? { kind: dto.kind } : {}),
          ...(dto.zone !== undefined ? { zone: dto.zone } : {}),
          ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
          ...(dto.categoryId !== undefined
            ? { categoryId: dto.categoryId }
            : {}),
          ...(dto.openMegaMenu !== undefined
            ? { openMegaMenu: dto.openMegaMenu }
            : {}),
          ...(dto.bannerImageUrl !== undefined
            ? {
                bannerImageUrl:
                  dto.bannerImageUrl === null
                    ? null
                    : dto.bannerImageUrl.trim() || null,
              }
            : {}),
          ...(dto.bannerHref !== undefined
            ? {
                bannerHref:
                  dto.bannerHref === null
                    ? null
                    : dto.bannerHref.trim() || null,
              }
            : {}),
          ...(dto.bannerAlt !== undefined
            ? {
                bannerAlt:
                  dto.bannerAlt === null ? null : dto.bannerAlt.trim() || null,
              }
            : {}),
        },
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
    );
  }

  async reorder(dto: ReorderStorefrontNavDto) {
    await this.runNavQuery(async () => {
      await this.prisma.$transaction(
        dto.items.map((item) =>
          this.prisma.storefrontNavLink.update({
            where: { id: item.id },
            data: {
              parentId: item.parentId ?? null,
              sortOrder: item.sortOrder,
              zone: item.zone,
            },
          }),
        ),
      );
    });
    return { ok: true };
  }

  async delete(id: string) {
    const row = await this.runNavQuery(() =>
      this.prisma.storefrontNavLink.findUnique({ where: { id } }),
    );
    if (!row) throw new NotFoundException('Nav link not found');
    await this.runNavQuery(() =>
      this.prisma.storefrontNavLink.delete({ where: { id } }),
    );
    return { id };
  }
}

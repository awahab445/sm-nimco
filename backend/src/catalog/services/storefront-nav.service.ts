import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { CreateStorefrontNavLinkDto } from '../dto/create-storefront-nav-link.dto';
import { UpdateStorefrontNavLinkDto } from '../dto/update-storefront-nav-link.dto';

export type StorefrontNavLinkPublic = {
  id: string;
  label: string;
  secondaryLabel: string | null;
  href: string;
  sortOrder: number;
  kind: string;
};

@Injectable()
export class StorefrontNavService {
  constructor(private readonly prisma: PrismaService) {}

  /** Maps missing-table (migration not applied) to a clear API error instead of a generic 500. */
  private async runNavQuery<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2021') {
        throw new ServiceUnavailableException(
          'Store navigation is not available: the storefront_nav_links table is missing. Apply Prisma migrations, or run prisma/migrations/20260512180000_storefront_nav_links/migration.sql against the database.',
        );
      }
      throw e;
    }
  }

  private async assertSingleMega(kind: string, isActive: boolean, excludeId?: string): Promise<void> {
    if (kind !== 'MEGA_CATEGORIES' || !isActive) return;
    const other = await this.runNavQuery(() =>
      this.prisma.storefrontNavLink.findFirst({
        where: {
          kind: 'MEGA_CATEGORIES',
          isActive: true,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      }),
    );
    if (other) {
      throw new ConflictException(
        'Only one active "MEGA_CATEGORIES" item is allowed. Deactivate or change the other row first.',
      );
    }
  }

  async findPublic(): Promise<StorefrontNavLinkPublic[]> {
    const rows = await this.runNavQuery(() =>
      this.prisma.storefrontNavLink.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
        select: {
          id: true,
          label: true,
          secondaryLabel: true,
          href: true,
          sortOrder: true,
          kind: true,
        },
      }),
    );
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      secondaryLabel: r.secondaryLabel,
      href: r.href,
      sortOrder: r.sortOrder,
      kind: r.kind,
    }));
  }

  async listAllForAdmin() {
    return this.runNavQuery(() =>
      this.prisma.storefrontNavLink.findMany({
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      }),
    );
  }

  async create(dto: CreateStorefrontNavLinkDto) {
    const kind = dto.kind;
    const isActive = dto.isActive ?? true;
    await this.assertSingleMega(kind, isActive);
    return this.runNavQuery(() =>
      this.prisma.storefrontNavLink.create({
        data: {
          label: dto.label.trim(),
          secondaryLabel: dto.secondaryLabel?.trim() || null,
          href: dto.href.trim(),
          sortOrder: dto.sortOrder ?? 0,
          isActive,
          kind,
        },
      }),
    );
  }

  async update(id: string, dto: UpdateStorefrontNavLinkDto) {
    const row = await this.runNavQuery(() =>
      this.prisma.storefrontNavLink.findUnique({ where: { id } }),
    );
    if (!row) throw new NotFoundException('Nav link not found');

    const nextKind = dto.kind ?? row.kind;
    const nextActive = dto.isActive ?? row.isActive;
    await this.assertSingleMega(nextKind, nextActive, id);

    return this.runNavQuery(() =>
      this.prisma.storefrontNavLink.update({
        where: { id },
        data: {
          ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
          ...(dto.secondaryLabel !== undefined
            ? { secondaryLabel: dto.secondaryLabel === null ? null : dto.secondaryLabel.trim() || null }
            : {}),
          ...(dto.href !== undefined ? { href: dto.href.trim() } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
          ...(dto.kind !== undefined ? { kind: dto.kind } : {}),
        },
      }),
    );
  }

  async delete(id: string) {
    const row = await this.runNavQuery(() =>
      this.prisma.storefrontNavLink.findUnique({ where: { id } }),
    );
    if (!row) throw new NotFoundException('Nav link not found');
    await this.runNavQuery(() => this.prisma.storefrontNavLink.delete({ where: { id } }));
    return { id };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { CreateBundleDealDto } from '../dto/create-bundle-deal.dto';
import { UpdateBundleDealDto } from '../dto/update-bundle-deal.dto';
import { BundleDealItemDto } from '../dto/bundle-deal-item.dto';
import { BundleDealPricingService } from './bundle-deal-pricing.service';

const dealInclude = {
  items: {
    orderBy: { position: 'asc' as const },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
      variant: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          attributes: true,
          optionValues: {
            select: {
              option: { select: { id: true, name: true, code: true } },
              value: { select: { id: true, value: true, code: true } },
            },
          },
        },
      },
    },
  },
};

@Injectable()
export class BundleDealService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: BundleDealPricingService,
  ) {}

  isCurrentlyActive(
    deal: {
      status: string;
      deletedAt?: Date | null;
      validFrom?: Date | null;
      validTo?: Date | null;
    },
    now: Date = new Date(),
  ): boolean {
    if (deal.deletedAt) return false;
    if (deal.status !== 'active') return false;
    if (deal.validFrom && deal.validFrom > now) return false;
    if (deal.validTo && deal.validTo < now) return false;
    return true;
  }

  async generateSlug(title: string, existingId?: string): Promise<string> {
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.bundleDeal.findUnique({
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

  private mapDeal(deal: any) {
    return {
      ...deal,
      dealPrice: Number(deal.dealPrice),
      compareAtTotal: Number(deal.compareAtTotal),
      savingsAmount: Number(deal.savingsAmount),
      savingsPercent: deal.savingsPercent != null ? Number(deal.savingsPercent) : null,
      items: deal.items?.map((item: any) => ({
        ...item,
        unitListPrice: item.unitListPrice != null ? Number(item.unitListPrice) : null,
        variant: item.variant
          ? {
              ...item.variant,
              price: Number(item.variant.price),
              variantAttributes: item.variant.optionValues
                ?.map((entry: any) => {
                  const optionName = entry.option?.name?.trim();
                  const valueLabel = entry.value?.value?.trim();
                  if (!optionName || !valueLabel) return null;
                  return `${optionName}: ${valueLabel}`;
                })
                .filter((value: string | null): value is string => Boolean(value)),
            }
          : null,
      })),
    };
  }

  async listDeals(options: {
    q?: string;
    status?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    activeOnly?: boolean;
  }) {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BundleDealWhereInput = {
      deletedAt: null,
    };

    if (options.activeOnly) {
      const now = new Date();
      where.status = 'active';
      where.AND = [
        { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
        { OR: [{ validTo: null }, { validTo: { gte: now } }] },
      ];
    } else if (options.status) {
      where.status = options.status;
    }

    if (options.featured) {
      where.isFeatured = true;
    }

    if (options.q?.trim()) {
      const q = options.q.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [deals, total] = await Promise.all([
      this.prisma.bundleDeal.findMany({
        where,
        include: {
          items: { select: { id: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.bundleDeal.count({ where }),
    ]);

    return {
      data: deals.map((d) => ({
        ...this.mapDeal(d),
        itemCount: d.items.length,
        items: undefined,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, includeDeleted = false) {
    const deal = await this.prisma.bundleDeal.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: dealInclude,
    });

    if (!deal) {
      throw new NotFoundException(`Bundle deal ${id} not found`);
    }

    return this.mapDeal(deal);
  }

  async findBySlug(slug: string) {
    const deal = await this.prisma.bundleDeal.findFirst({
      where: { slug, deletedAt: null },
      include: dealInclude,
    });

    if (!deal) {
      throw new NotFoundException(`Bundle deal "${slug}" not found`);
    }

    if (!this.isCurrentlyActive(deal)) {
      throw new NotFoundException(`Bundle deal "${slug}" is not available`);
    }

    return this.mapDeal(deal);
  }

  private async buildItemsData(items: BundleDealItemDto[], pricing: Awaited<ReturnType<BundleDealPricingService['computePricing']>>) {
    return items.map((item, index) => {
      const resolved = pricing.items[index];
      return {
        productId: item.productId,
        variantId: resolved.variantId,
        quantity: item.quantity,
        position: index,
        unitListPrice: resolved.unitListPrice,
      };
    });
  }

  async create(dto: CreateBundleDealDto) {
    const pricing = await this.pricingService.computePricing(dto.items, dto.dealPrice);
    const slug = dto.slug?.trim() || (await this.generateSlug(dto.title));
    const itemsData = await this.buildItemsData(dto.items, pricing);

    const deal = await this.prisma.bundleDeal.create({
      data: {
        title: dto.title.trim(),
        slug,
        description: dto.description?.trim() || null,
        status: dto.status ?? 'draft',
        isFeatured: dto.isFeatured ?? false,
        dealPrice: pricing.dealPrice,
        compareAtTotal: pricing.compareAtTotal,
        savingsAmount: pricing.savingsAmount,
        savingsPercent: pricing.savingsPercent,
        imageUrl: dto.imageUrl?.trim() || null,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
        items: { create: itemsData },
      },
      include: dealInclude,
    });

    return this.mapDeal(deal);
  }

  async update(id: string, dto: UpdateBundleDealDto) {
    const existing = await this.findById(id);

    let pricing: Awaited<ReturnType<BundleDealPricingService['computePricing']>> | null = null;
    if (dto.items || dto.dealPrice != null) {
      const items = dto.items ?? existing.items.map((i: any) => ({
        productId: i.productId,
        variantId: i.variantId ?? undefined,
        quantity: i.quantity,
      }));
      const dealPrice = dto.dealPrice ?? existing.dealPrice;
      pricing = await this.pricingService.computePricing(items, dealPrice);
    }

    let slug = existing.slug;
    if (dto.slug?.trim() && dto.slug.trim() !== existing.slug) {
      slug = await this.generateSlug(dto.slug.trim(), id);
    } else if (dto.title?.trim() && dto.title.trim() !== existing.title && !dto.slug) {
      slug = await this.generateSlug(dto.title.trim(), id);
    }

    const updateData: Prisma.BundleDealUpdateInput = {
      ...(dto.title != null ? { title: dto.title.trim() } : {}),
      slug,
      ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
      ...(dto.status != null ? { status: dto.status } : {}),
      ...(dto.isFeatured != null ? { isFeatured: dto.isFeatured } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl?.trim() || null } : {}),
      ...(dto.validFrom !== undefined
        ? { validFrom: dto.validFrom ? new Date(dto.validFrom) : null }
        : {}),
      ...(dto.validTo !== undefined
        ? { validTo: dto.validTo ? new Date(dto.validTo) : null }
        : {}),
      ...(pricing
        ? {
            dealPrice: pricing.dealPrice,
            compareAtTotal: pricing.compareAtTotal,
            savingsAmount: pricing.savingsAmount,
            savingsPercent: pricing.savingsPercent,
          }
        : {}),
    };

    const deal = await this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.bundleDealItem.deleteMany({ where: { bundleDealId: id } });
        const itemsData = await this.buildItemsData(dto.items, pricing!);
        await tx.bundleDealItem.createMany({
          data: itemsData.map((row) => ({ ...row, bundleDealId: id })),
        });
      }

      return tx.bundleDeal.update({
        where: { id },
        data: updateData,
        include: dealInclude,
      });
    });

    return this.mapDeal(deal);
  }

  async remove(id: string) {
    await this.findById(id);
    const deal = await this.prisma.bundleDeal.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: dealInclude,
    });
    return this.mapDeal(deal);
  }

  async getActiveDealForCart(bundleDealId: string) {
    const deal = await this.prisma.bundleDeal.findFirst({
      where: { id: bundleDealId, deletedAt: null },
      include: dealInclude,
    });

    if (!deal) {
      throw new NotFoundException(`Bundle deal ${bundleDealId} not found`);
    }

    if (!this.isCurrentlyActive(deal)) {
      throw new BadRequestException('This bundle deal is not currently available');
    }

    if (deal.items.length < 3) {
      throw new BadRequestException('Bundle deal is misconfigured (fewer than 3 items)');
    }

    return this.mapDeal(deal);
  }
}

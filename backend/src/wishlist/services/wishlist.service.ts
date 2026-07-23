import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { ProductQuery } from '../../catalog/queries/product.query';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(private readonly prisma: PrismaService) {}

  private productInclude() {
    return ProductQuery.buildIncludeClause();
  }

  private toWishlistRow(item: {
    id: string;
    productId: string;
    createdAt: Date;
    product: unknown;
  }) {
    return {
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: item.product,
    };
  }

  /**
   * List wishlist items for a customer (newest first), with product details.
   */
  async findAll(customerId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: {
        customerId,
        product: { deletedAt: null, status: 'active' },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { include: this.productInclude() },
      },
    });

    return items.map((item) => this.toWishlistRow(item));
  }

  async count(customerId: string): Promise<{ count: number }> {
    const count = await this.prisma.wishlistItem.count({
      where: {
        customerId,
        product: { deletedAt: null, status: 'active' },
      },
    });
    return { count };
  }

  /** Idempotent add — returns existing row if already wishlisted. */
  async add(customerId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null, status: 'active' },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        customerId_productId: { customerId, productId },
      },
      include: {
        product: { include: this.productInclude() },
      },
    });
    if (existing) {
      return this.toWishlistRow(existing);
    }

    const item = await this.prisma.wishlistItem.create({
      data: { customerId, productId },
      include: {
        product: { include: this.productInclude() },
      },
    });

    this.logger.debug(
      `Wishlist add customer=${customerId} product=${productId}`,
    );

    return this.toWishlistRow(item);
  }

  async remove(customerId: string, productId: string) {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        customerId_productId: { customerId, productId },
      },
    });
    if (!existing) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.prisma.wishlistItem.delete({
      where: { id: existing.id },
    });

    return { ok: true, productId };
  }

  /**
   * Upsert guest localStorage product IDs into the customer's wishlist.
   * Skips unknown / unpublished products; ignores duplicates.
   */
  async merge(customerId: string, productIds: string[]) {
    const uniqueIds = [...new Set(productIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return this.findAll(customerId);
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: uniqueIds },
        deletedAt: null,
        status: 'active',
      },
      select: { id: true },
    });
    const validIds = new Set(products.map((p) => p.id));

    const existing = await this.prisma.wishlistItem.findMany({
      where: { customerId, productId: { in: [...validIds] } },
      select: { productId: true },
    });
    const already = new Set(existing.map((e) => e.productId));

    const toCreate = [...validIds].filter((id) => !already.has(id));
    if (toCreate.length > 0) {
      await this.prisma.wishlistItem.createMany({
        data: toCreate.map((productId) => ({ customerId, productId })),
        skipDuplicates: true,
      });
    }

    this.logger.debug(
      `Wishlist merge customer=${customerId} added=${toCreate.length}`,
    );

    return this.findAll(customerId);
  }
}

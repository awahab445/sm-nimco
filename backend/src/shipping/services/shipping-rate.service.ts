import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import {
  CalculateShippingFeeDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
} from '../dto/shipping-rate.dto';
import { parseShippingRatesImport } from '../utils/shipping-rate-import.parser';
import { toShippingWeightKg } from '../utils/shipping-weight';

export type ShippingRateRecord = {
  id: string;
  province: string;
  city: string | null;
  minWeightKg: number;
  maxWeightKg: number;
  rateAmount: number;
  isCodAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ShippingFeeResult = {
  rateId: string;
  province: string;
  city: string | null;
  minWeightKg: number;
  maxWeightKg: number;
  rateAmount: number;
  isCodAvailable: boolean;
  matchedBy: 'city' | 'province';
  totalWeightKg: number;
};

export type ShippingRateListResult = {
  items: ShippingRateRecord[];
  total: number;
  page: number;
  pageSize: number;
};

@Injectable()
export class ShippingRateService {
  private readonly logger = new Logger(ShippingRateService.name);

  constructor(private readonly prisma: PrismaService) {}

  private toNumber(
    value: Prisma.Decimal | number | string | null | undefined,
  ): number {
    if (value == null) return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
      const n = parseFloat(value);
      return Number.isFinite(n) ? n : 0;
    }
    return value.toNumber();
  }

  private mapRate(row: {
    id: string;
    province: string;
    city: string | null;
    minWeightKg: Prisma.Decimal | number;
    maxWeightKg: Prisma.Decimal | number;
    rateAmount: Prisma.Decimal | number;
    isCodAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ShippingRateRecord {
    return {
      id: row.id,
      province: row.province,
      city: row.city,
      minWeightKg: this.toNumber(row.minWeightKg),
      maxWeightKg: this.toNumber(row.maxWeightKg),
      rateAmount: this.toNumber(row.rateAmount),
      isCodAvailable: row.isCodAvailable,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private normalizeProvince(province: string): string {
    return province.trim();
  }

  private normalizeCity(city?: string | null): string | null {
    const trimmed = city?.trim();
    return trimmed ? trimmed : null;
  }

  /**
   * Resolve cart weight from product/variant shipping weights.
   * Hierarchy: variant.shippingWeight (>0) → product.shippingWeight (>0) → 1.0 kg.
   * Grams normalize to kg. Each line is `resolvedWeightKg * quantity`.
   */
  async resolveTotalWeightKg(
    totalWeightKg?: number,
    items?: Array<{
      variantId: string;
      quantity: number;
      weight?: number;
      shippingWeightUnit?: string;
    }>,
  ): Promise<number> {
    if (totalWeightKg != null && Number.isFinite(totalWeightKg)) {
      return Math.max(0, totalWeightKg);
    }
    if (!items?.length) return 0;

    const variantIds = [
      ...new Set(items.map((i) => i.variantId).filter(Boolean)),
    ];
    const variants =
      variantIds.length > 0
        ? await this.prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            select: {
              id: true,
              shippingWeight: true,
              shippingWeightUnit: true,
              product: {
                select: {
                  shippingWeight: true,
                  shippingWeightUnit: true,
                },
              },
            },
          })
        : [];
    const weightByVariant = new Map(
      variants.map((v) => {
        const variantWeight = Number(v.shippingWeight);
        const productWeight = Number(v.product?.shippingWeight);
        let unitWeight = 1;
        let unit = 'KG';
        if (Number.isFinite(variantWeight) && variantWeight > 0) {
          unitWeight = variantWeight;
          unit = v.shippingWeightUnit ?? 'KG';
        } else if (Number.isFinite(productWeight) && productWeight > 0) {
          unitWeight = productWeight;
          unit = v.product?.shippingWeightUnit ?? 'KG';
        }
        return [v.id, toShippingWeightKg(unitWeight, unit)] as const;
      }),
    );

    return items.reduce((sum, item) => {
      let unitWeightInKg: number;
      if (
        item.weight != null &&
        Number.isFinite(item.weight) &&
        item.weight > 0
      ) {
        unitWeightInKg = toShippingWeightKg(
          item.weight,
          item.shippingWeightUnit,
        );
      } else {
        unitWeightInKg = weightByVariant.get(item.variantId) ?? 1;
      }
      return sum + Math.max(0, unitWeightInKg) * Math.max(0, item.quantity);
    }, 0);
  }

  /**
   * City match first for the weight band; fall back to province-default (null city).
   */
  async calculateShippingFee(
    province: string,
    city: string | null | undefined,
    totalWeightKg: number,
  ): Promise<ShippingFeeResult | null> {
    const normalizedProvince = this.normalizeProvince(province);
    const normalizedCity = this.normalizeCity(city);
    const weight = Math.max(0, totalWeightKg);

    if (!normalizedProvince) {
      throw new BadRequestException('Province is required');
    }

    const weightFilter: Prisma.ShippingRateWhereInput = {
      province: { equals: normalizedProvince, mode: 'insensitive' },
      minWeightKg: { lte: weight },
      maxWeightKg: { gte: weight },
    };

    if (normalizedCity) {
      const cityMatch = await this.prisma.shippingRate.findFirst({
        where: {
          ...weightFilter,
          city: { equals: normalizedCity, mode: 'insensitive' },
        },
        orderBy: [{ rateAmount: 'asc' }, { updatedAt: 'desc' }],
      });
      if (cityMatch) {
        const mapped = this.mapRate(cityMatch);
        return {
          rateId: mapped.id,
          province: mapped.province,
          city: mapped.city,
          minWeightKg: mapped.minWeightKg,
          maxWeightKg: mapped.maxWeightKg,
          rateAmount: mapped.rateAmount,
          isCodAvailable: mapped.isCodAvailable,
          matchedBy: 'city',
          totalWeightKg: weight,
        };
      }
    }

    const provinceMatch = await this.prisma.shippingRate.findFirst({
      where: {
        ...weightFilter,
        city: null,
      },
      orderBy: [{ rateAmount: 'asc' }, { updatedAt: 'desc' }],
    });

    if (!provinceMatch) return null;

    const mapped = this.mapRate(provinceMatch);
    return {
      rateId: mapped.id,
      province: mapped.province,
      city: mapped.city,
      minWeightKg: mapped.minWeightKg,
      maxWeightKg: mapped.maxWeightKg,
      rateAmount: mapped.rateAmount,
      isCodAvailable: mapped.isCodAvailable,
      matchedBy: 'province',
      totalWeightKg: weight,
    };
  }

  async calculateShippingFeeFromDto(
    dto: CalculateShippingFeeDto,
  ): Promise<ShippingFeeResult | null> {
    const totalWeightKg = await this.resolveTotalWeightKg(
      dto.totalWeightKg,
      dto.items,
    );
    return this.calculateShippingFee(dto.province, dto.city, totalWeightKg);
  }

  async listRates(params: {
    page?: number;
    pageSize?: number;
    province?: string;
    city?: string;
    search?: string;
  }): Promise<ShippingRateListResult> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
    const where: Prisma.ShippingRateWhereInput = {};

    if (params.province?.trim()) {
      where.province = {
        equals: params.province.trim(),
        mode: 'insensitive',
      };
    }
    if (params.city?.trim()) {
      where.city = { equals: params.city.trim(), mode: 'insensitive' };
    }
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { province: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.shippingRate.count({ where }),
      this.prisma.shippingRate.findMany({
        where,
        orderBy: [{ province: 'asc' }, { city: 'asc' }, { minWeightKg: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map((r) => this.mapRate(r)),
      total,
      page,
      pageSize,
    };
  }

  async getById(id: string): Promise<ShippingRateRecord> {
    const row = await this.prisma.shippingRate.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Shipping rate ${id} not found`);
    }
    return this.mapRate(row);
  }

  async create(dto: CreateShippingRateDto): Promise<ShippingRateRecord> {
    if (dto.maxWeightKg < dto.minWeightKg) {
      throw new BadRequestException('maxWeightKg must be >= minWeightKg');
    }
    const row = await this.prisma.shippingRate.create({
      data: {
        province: this.normalizeProvince(dto.province),
        city: this.normalizeCity(dto.city),
        minWeightKg: dto.minWeightKg,
        maxWeightKg: dto.maxWeightKg,
        rateAmount: dto.rateAmount,
        isCodAvailable: dto.isCodAvailable ?? true,
      },
    });
    return this.mapRate(row);
  }

  async update(
    id: string,
    dto: UpdateShippingRateDto,
  ): Promise<ShippingRateRecord> {
    const existing = await this.getById(id);
    const minWeightKg = dto.minWeightKg ?? existing.minWeightKg;
    const maxWeightKg = dto.maxWeightKg ?? existing.maxWeightKg;
    if (maxWeightKg < minWeightKg) {
      throw new BadRequestException('maxWeightKg must be >= minWeightKg');
    }

    const row = await this.prisma.shippingRate.update({
      where: { id },
      data: {
        ...(dto.province != null
          ? { province: this.normalizeProvince(dto.province) }
          : {}),
        ...(dto.city !== undefined
          ? { city: this.normalizeCity(dto.city) }
          : {}),
        ...(dto.minWeightKg != null ? { minWeightKg: dto.minWeightKg } : {}),
        ...(dto.maxWeightKg != null ? { maxWeightKg: dto.maxWeightKg } : {}),
        ...(dto.rateAmount != null ? { rateAmount: dto.rateAmount } : {}),
        ...(dto.isCodAvailable != null
          ? { isCodAvailable: dto.isCodAvailable }
          : {}),
      },
    });
    return this.mapRate(row);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.prisma.shippingRate.delete({ where: { id } });
  }

  /**
   * Bulk upsert CSV rows keyed by province + city + weight band.
   */
  async uploadCsv(file: {
    buffer: Buffer;
    originalname: string;
    mimetype?: string;
  }): Promise<{
    importedRows: number;
    created: number;
    updated: number;
  }> {
    const rows = parseShippingRatesImport(file);
    let created = 0;
    let updated = 0;

    for (const row of rows) {
      const province = this.normalizeProvince(row.province);
      const city = this.normalizeCity(row.city);

      const existing = await this.prisma.shippingRate.findFirst({
        where: {
          province: { equals: province, mode: 'insensitive' },
          ...(city
            ? { city: { equals: city, mode: 'insensitive' } }
            : { city: null }),
          minWeightKg: row.minWeightKg,
          maxWeightKg: row.maxWeightKg,
        },
      });

      if (existing) {
        await this.prisma.shippingRate.update({
          where: { id: existing.id },
          data: {
            province,
            city,
            rateAmount: row.rateAmount,
            isCodAvailable: row.isCodAvailable,
          },
        });
        updated += 1;
      } else {
        await this.prisma.shippingRate.create({
          data: {
            province,
            city,
            minWeightKg: row.minWeightKg,
            maxWeightKg: row.maxWeightKg,
            rateAmount: row.rateAmount,
            isCodAvailable: row.isCodAvailable,
          },
        });
        created += 1;
      }
    }

    this.logger.log(
      `Shipping rates CSV import: ${rows.length} rows (${created} created, ${updated} updated)`,
    );

    return {
      importedRows: rows.length,
      created,
      updated,
    };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { UpdateCourierZoneRatesDto } from '../dto/courier-zone.dto';
import {
  applyShippingGst,
  calculateDualTierBaseShipping,
  roundShippingFee,
} from '../utils/shipping-fee';

export type CourierZoneRateInfo = {
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  rateLessThan10kg: number;
  rateGreaterOrEqual10kg: number;
};

export type CourierZoneRecord = {
  id: string;
  code: string;
  name: string;
  rateLessThan10kg: number;
  rateGreaterOrEqual10kg: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CourierCityService {
  constructor(private readonly prisma: PrismaService) {}

  private toNumber(value: unknown): number {
    if (value == null) return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
      const n = parseFloat(value);
      return Number.isFinite(n) ? n : 0;
    }
    if (
      typeof value === 'object' &&
      value !== null &&
      'toNumber' in value &&
      typeof (value as { toNumber: () => number }).toNumber === 'function'
    ) {
      return (value as { toNumber: () => number }).toNumber();
    }
    return 0;
  }

  /**
   * Dual-tier per-kg cost (before GST):
   * - weight < 10  → weight × rateLessThan10kg
   * - weight >= 10 → weight × rateGreaterOrEqual10kg
   */
  calculateDualTierCost(
    totalWeightKg: number,
    rates: {
      rateLessThan10kg: number;
      rateGreaterOrEqual10kg: number;
    },
  ): number {
    return roundShippingFee(
      calculateDualTierBaseShipping(totalWeightKg, rates),
    );
  }

  /** Apply GST on top of a base shipping amount. */
  applyGst(baseShipping: number, shippingGstPercentage: number): number {
    return roundShippingFee(
      applyShippingGst(baseShipping, shippingGstPercentage),
    );
  }

  async getProvinces(): Promise<string[]> {
    const results = await this.prisma.courierCity.findMany({
      where: { isActive: true },
      select: { province: true },
      distinct: ['province'],
      orderBy: { province: 'asc' },
    });
    return results.map((r) => r.province);
  }

  async getCitiesByProvince(province: string) {
    return this.prisma.courierCity.findMany({
      where: { province, isActive: true },
      select: {
        id: true,
        cityCode: true,
        name: true,
        province: true,
        zoneId: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCityById(id: string) {
    return this.prisma.courierCity.findUnique({
      where: { id },
      include: { zone: true },
    });
  }

  async resolveZoneForCity(
    cityName: string,
  ): Promise<CourierZoneRateInfo | null> {
    const city = await this.prisma.courierCity.findFirst({
      where: {
        name: { equals: cityName, mode: 'insensitive' },
        isActive: true,
      },
      include: { zone: true },
    });
    if (!city?.zone?.isActive) return null;
    return this.mapZoneInfo(city.zone);
  }

  async resolveZoneForCityId(
    cityId: string,
  ): Promise<CourierZoneRateInfo | null> {
    const city = await this.prisma.courierCity.findFirst({
      where: { id: cityId, isActive: true },
      include: { zone: true },
    });
    if (!city?.zone?.isActive) return null;
    return this.mapZoneInfo(city.zone);
  }

  private mapZoneInfo(zone: {
    id: string;
    code: string;
    name: string;
    rateLessThan10kg: unknown;
    rateGreaterOrEqual10kg: unknown;
  }): CourierZoneRateInfo {
    return {
      zoneId: zone.id,
      zoneCode: zone.code,
      zoneName: zone.name,
      rateLessThan10kg: this.toNumber(zone.rateLessThan10kg),
      rateGreaterOrEqual10kg: this.toNumber(zone.rateGreaterOrEqual10kg),
    };
  }

  async listZones(): Promise<CourierZoneRecord[]> {
    const rows = await this.prisma.courierZone.findMany({
      orderBy: { code: 'asc' },
    });
    return rows.map((z) => ({
      id: z.id,
      code: z.code,
      name: z.name,
      rateLessThan10kg: this.toNumber(z.rateLessThan10kg),
      rateGreaterOrEqual10kg: this.toNumber(z.rateGreaterOrEqual10kg),
      isActive: z.isActive,
      createdAt: z.createdAt,
      updatedAt: z.updatedAt,
    }));
  }

  async updateZoneRates(
    id: string,
    dto: UpdateCourierZoneRatesDto,
  ): Promise<CourierZoneRecord> {
    const existing = await this.prisma.courierZone.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Courier zone ${id} not found`);
    }

    if (
      dto.rateLessThan10kg != null &&
      dto.rateLessThan10kg < 0
    ) {
      throw new BadRequestException('rateLessThan10kg must be >= 0');
    }
    if (
      dto.rateGreaterOrEqual10kg != null &&
      dto.rateGreaterOrEqual10kg < 0
    ) {
      throw new BadRequestException('rateGreaterOrEqual10kg must be >= 0');
    }

    const updated = await this.prisma.courierZone.update({
      where: { id },
      data: {
        ...(dto.name != null ? { name: dto.name.trim() } : {}),
        ...(dto.rateLessThan10kg != null
          ? { rateLessThan10kg: dto.rateLessThan10kg }
          : {}),
        ...(dto.rateGreaterOrEqual10kg != null
          ? { rateGreaterOrEqual10kg: dto.rateGreaterOrEqual10kg }
          : {}),
      },
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      rateLessThan10kg: this.toNumber(updated.rateLessThan10kg),
      rateGreaterOrEqual10kg: this.toNumber(updated.rateGreaterOrEqual10kg),
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { UpdateCourierZoneRatesDto } from '../dto/courier-zone.dto';

export type CourierZoneRateInfo = {
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  rateUpTo5kg: number;
  rateUpTo10kg: number;
  perKgOver10kg: number;
};

export type CourierZoneRecord = {
  id: string;
  code: string;
  name: string;
  rateUpTo5kg: number;
  rateUpTo10kg: number;
  perKgOver10kg: number;
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
   * Weight-tier shipping cost:
   * - <= 5kg  → rateUpTo5kg
   * - <= 10kg → rateUpTo10kg
   * - > 10kg  → rateUpTo10kg + (weight - 10) * perKgOver10kg
   */
  calculateTierCost(
    totalWeightKg: number,
    rates: {
      rateUpTo5kg: number;
      rateUpTo10kg: number;
      perKgOver10kg: number;
    },
  ): number {
    const weight = Math.max(0, totalWeightKg);
    if (weight <= 5) return Math.max(0, rates.rateUpTo5kg);
    if (weight <= 10) return Math.max(0, rates.rateUpTo10kg);
    const overage = (weight - 10) * rates.perKgOver10kg;
    return Math.max(0, rates.rateUpTo10kg + overage);
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
    rateUpTo5kg: unknown;
    rateUpTo10kg: unknown;
    perKgOver10kg: unknown;
  }): CourierZoneRateInfo {
    return {
      zoneId: zone.id,
      zoneCode: zone.code,
      zoneName: zone.name,
      rateUpTo5kg: this.toNumber(zone.rateUpTo5kg),
      rateUpTo10kg: this.toNumber(zone.rateUpTo10kg),
      perKgOver10kg: this.toNumber(zone.perKgOver10kg),
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
      rateUpTo5kg: this.toNumber(z.rateUpTo5kg),
      rateUpTo10kg: this.toNumber(z.rateUpTo10kg),
      perKgOver10kg: this.toNumber(z.perKgOver10kg),
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
      dto.rateUpTo5kg != null &&
      dto.rateUpTo10kg != null &&
      dto.rateUpTo10kg < dto.rateUpTo5kg
    ) {
      throw new BadRequestException(
        'rateUpTo10kg should be greater than or equal to rateUpTo5kg',
      );
    }

    const updated = await this.prisma.courierZone.update({
      where: { id },
      data: {
        ...(dto.name != null ? { name: dto.name.trim() } : {}),
        ...(dto.rateUpTo5kg != null ? { rateUpTo5kg: dto.rateUpTo5kg } : {}),
        ...(dto.rateUpTo10kg != null ? { rateUpTo10kg: dto.rateUpTo10kg } : {}),
        ...(dto.perKgOver10kg != null
          ? { perKgOver10kg: dto.perKgOver10kg }
          : {}),
      },
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      rateUpTo5kg: this.toNumber(updated.rateUpTo5kg),
      rateUpTo10kg: this.toNumber(updated.rateUpTo10kg),
      perKgOver10kg: this.toNumber(updated.perKgOver10kg),
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

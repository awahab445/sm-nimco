import { BadRequestException, Injectable } from '@nestjs/common';
import type { StoreSettings } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { isStoreThemeId, normalizeStoreThemeId } from '../constants/themes';
import { UpdateStoreOrderSettingsDto } from '../dto/update-store-order-settings.dto';

export type PublicThemeSettings = {
  theme: string;
};

export type AdminThemeSettings = PublicThemeSettings & {
  id: string;
  updatedAt: Date;
  updatedByAdminUserId: string | null;
};

export type PublicStoreOrderSettings = {
  minimumOrderAmount: number;
  freeDeliveryThreshold: number;
  shippingGstPercentage: number;
};

export type AdminStoreOrderSettings = PublicStoreOrderSettings & {
  id: string;
  updatedAt: Date;
  updatedByAdminUserId: string | null;
};

const DEFAULT_MINIMUM_ORDER_AMOUNT = 800;
const DEFAULT_FREE_DELIVERY_THRESHOLD = 2000;
const DEFAULT_SHIPPING_GST_PERCENTAGE = 18;

@Injectable()
export class StoreSettingsService {
  private readonly singletonId = 'default';
  private readonly defaultTheme = 'tailwind';

  constructor(private readonly prisma: PrismaService) {}

  private toNumber(
    value: Prisma.Decimal | number | string | null | undefined,
    fallback: number,
  ): number {
    if (value == null) return fallback;
    const n =
      typeof value === 'number'
        ? value
        : parseFloat(typeof value === 'string' ? value : value.toString());
    return Number.isFinite(n) ? n : fallback;
  }

  private toPublicTheme(row: StoreSettings): PublicThemeSettings {
    return {
      theme: normalizeStoreThemeId(row.currentTheme),
    };
  }

  private toAdminTheme(row: StoreSettings): AdminThemeSettings {
    return {
      ...this.toPublicTheme(row),
      id: row.id,
      updatedAt: row.updatedAt,
      updatedByAdminUserId: row.updatedByAdminUserId,
    };
  }

  private toPublicOrder(row: StoreSettings): PublicStoreOrderSettings {
    return {
      minimumOrderAmount: this.toNumber(
        row.minimumOrderAmount,
        DEFAULT_MINIMUM_ORDER_AMOUNT,
      ),
      freeDeliveryThreshold: this.toNumber(
        row.freeDeliveryThreshold,
        DEFAULT_FREE_DELIVERY_THRESHOLD,
      ),
      shippingGstPercentage: this.toNumber(
        row.shippingGstPercentage,
        DEFAULT_SHIPPING_GST_PERCENTAGE,
      ),
    };
  }

  private toAdminOrder(row: StoreSettings): AdminStoreOrderSettings {
    return {
      ...this.toPublicOrder(row),
      id: row.id,
      updatedAt: row.updatedAt,
      updatedByAdminUserId: row.updatedByAdminUserId,
    };
  }

  async ensureDefaults(): Promise<StoreSettings> {
    return this.prisma.storeSettings.upsert({
      where: { id: this.singletonId },
      update: {},
      create: {
        id: this.singletonId,
        currentTheme: this.defaultTheme,
        minimumOrderAmount: new Prisma.Decimal(DEFAULT_MINIMUM_ORDER_AMOUNT),
        freeDeliveryThreshold: new Prisma.Decimal(
          DEFAULT_FREE_DELIVERY_THRESHOLD,
        ),
        shippingGstPercentage: new Prisma.Decimal(
          DEFAULT_SHIPPING_GST_PERCENTAGE,
        ),
      },
    });
  }

  async getPublicTheme(): Promise<PublicThemeSettings> {
    const row = await this.ensureDefaults();
    return this.toPublicTheme(row);
  }

  async getAdminTheme(): Promise<AdminThemeSettings> {
    const row = await this.ensureDefaults();
    return this.toAdminTheme(row);
  }

  async updateTheme(
    theme: string,
    adminUserId?: string,
  ): Promise<AdminThemeSettings> {
    if (!isStoreThemeId(theme)) {
      throw new BadRequestException(
        `Invalid theme "${theme}". Allowed values: essa-chemicals, mehfil-e-shireen, ember, tailwind, sm-nimco.`,
      );
    }

    await this.ensureDefaults();
    const row = await this.prisma.storeSettings.update({
      where: { id: this.singletonId },
      data: {
        currentTheme: theme,
        ...(adminUserId && { updatedByAdminUserId: adminUserId }),
      },
    });

    return this.toAdminTheme(row);
  }

  async getPublicOrderSettings(): Promise<PublicStoreOrderSettings> {
    const row = await this.ensureDefaults();
    return this.toPublicOrder(row);
  }

  async getAdminOrderSettings(): Promise<AdminStoreOrderSettings> {
    const row = await this.ensureDefaults();
    return this.toAdminOrder(row);
  }

  async updateOrderSettings(
    dto: UpdateStoreOrderSettingsDto,
    adminUserId?: string,
  ): Promise<AdminStoreOrderSettings> {
    if (
      dto.minimumOrderAmount === undefined &&
      dto.freeDeliveryThreshold === undefined &&
      dto.shippingGstPercentage === undefined
    ) {
      throw new BadRequestException(
        'Provide minimumOrderAmount, freeDeliveryThreshold, and/or shippingGstPercentage to update.',
      );
    }

    await this.ensureDefaults();
    const row = await this.prisma.storeSettings.update({
      where: { id: this.singletonId },
      data: {
        ...(dto.minimumOrderAmount !== undefined && {
          minimumOrderAmount: new Prisma.Decimal(dto.minimumOrderAmount),
        }),
        ...(dto.freeDeliveryThreshold !== undefined && {
          freeDeliveryThreshold: new Prisma.Decimal(dto.freeDeliveryThreshold),
        }),
        ...(dto.shippingGstPercentage !== undefined && {
          shippingGstPercentage: new Prisma.Decimal(dto.shippingGstPercentage),
        }),
        ...(adminUserId && { updatedByAdminUserId: adminUserId }),
      },
    });

    return this.toAdminOrder(row);
  }
}

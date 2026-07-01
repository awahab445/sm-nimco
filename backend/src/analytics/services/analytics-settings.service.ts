import { BadRequestException, Injectable } from '@nestjs/common';
import type { AnalyticsGa4Settings } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import {
  GA4_MEASUREMENT_ID_REGEX,
  ToggleGa4SettingsDto,
  UpdateGa4SettingsDto,
} from '../dto/update-ga4-settings.dto';

export type PublicGa4Config = {
  isEnabled: boolean;
  measurementId: string | null;
  debugMode: boolean;
  trackPageViews: boolean;
  trackCartEvents: boolean;
  trackCheckoutSteps: boolean;
  trackPurchases: boolean;
  trackRefunds: boolean;
  trackCustomEvents: boolean;
  anonymizeIp: boolean;
  currency: string;
};

export type AdminGa4Settings = PublicGa4Config & {
  id: string;
  updatedAt: Date;
  updatedByAdminUserId: string | null;
};

@Injectable()
export class AnalyticsSettingsService {
  private readonly singletonId = 'default';

  constructor(private readonly prisma: PrismaService) {}

  private toPublic(row: AnalyticsGa4Settings): PublicGa4Config {
    return {
      isEnabled: row.isEnabled,
      measurementId: row.measurementId,
      debugMode: row.debugMode,
      trackPageViews: row.trackPageViews,
      trackCartEvents: row.trackCartEvents,
      trackCheckoutSteps: row.trackCheckoutSteps,
      trackPurchases: row.trackPurchases,
      trackRefunds: row.trackRefunds,
      trackCustomEvents: row.trackCustomEvents,
      anonymizeIp: row.anonymizeIp,
      currency: row.currency,
    };
  }

  private toAdmin(row: AnalyticsGa4Settings): AdminGa4Settings {
    return {
      ...this.toPublic(row),
      id: row.id,
      updatedAt: row.updatedAt,
      updatedByAdminUserId: row.updatedByAdminUserId,
    };
  }

  async ensureDefaults(): Promise<AnalyticsGa4Settings> {
    return this.prisma.analyticsGa4Settings.upsert({
      where: { id: this.singletonId },
      update: {},
      create: { id: this.singletonId },
    });
  }

  async getPublicConfig(): Promise<PublicGa4Config> {
    const row = await this.ensureDefaults();
    const config = this.toPublic(row);
    if (!config.isEnabled || !config.measurementId) {
      return { ...config, isEnabled: false, measurementId: null };
    }
    return config;
  }

  async getAdminSettings(): Promise<AdminGa4Settings> {
    const row = await this.ensureDefaults();
    return this.toAdmin(row);
  }

  private validateEnable(
    measurementId: string | null | undefined,
    isEnabled: boolean,
  ): void {
    if (!isEnabled) return;
    const id = measurementId?.trim();
    if (!id || !GA4_MEASUREMENT_ID_REGEX.test(id)) {
      throw new BadRequestException(
        'A valid measurementId (G-XXXXXXXXXX) is required before enabling GA4.',
      );
    }
  }

  async updateSettings(
    dto: UpdateGa4SettingsDto,
    adminUserId?: string,
  ): Promise<AdminGa4Settings> {
    const current = await this.ensureDefaults();
    const measurementId =
      dto.measurementId !== undefined
        ? dto.measurementId?.trim() || null
        : current.measurementId;
    const isEnabled = dto.isEnabled ?? current.isEnabled;

    this.validateEnable(measurementId, isEnabled);

    const row = await this.prisma.analyticsGa4Settings.update({
      where: { id: this.singletonId },
      data: {
        ...(dto.measurementId !== undefined && { measurementId }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.debugMode !== undefined && { debugMode: dto.debugMode }),
        ...(dto.trackPageViews !== undefined && {
          trackPageViews: dto.trackPageViews,
        }),
        ...(dto.trackCartEvents !== undefined && {
          trackCartEvents: dto.trackCartEvents,
        }),
        ...(dto.trackCheckoutSteps !== undefined && {
          trackCheckoutSteps: dto.trackCheckoutSteps,
        }),
        ...(dto.trackPurchases !== undefined && {
          trackPurchases: dto.trackPurchases,
        }),
        ...(dto.trackRefunds !== undefined && {
          trackRefunds: dto.trackRefunds,
        }),
        ...(dto.trackCustomEvents !== undefined && {
          trackCustomEvents: dto.trackCustomEvents,
        }),
        ...(dto.anonymizeIp !== undefined && { anonymizeIp: dto.anonymizeIp }),
        ...(dto.currency !== undefined && {
          currency: dto.currency.trim().toUpperCase(),
        }),
        ...(adminUserId && { updatedByAdminUserId: adminUserId }),
      },
    });
    return this.toAdmin(row);
  }

  async toggleEnabled(
    dto: ToggleGa4SettingsDto,
    adminUserId?: string,
  ): Promise<AdminGa4Settings> {
    const current = await this.ensureDefaults();
    this.validateEnable(current.measurementId, dto.isEnabled);
    const row = await this.prisma.analyticsGa4Settings.update({
      where: { id: this.singletonId },
      data: {
        isEnabled: dto.isEnabled,
        ...(adminUserId && { updatedByAdminUserId: adminUserId }),
      },
    });
    return this.toAdmin(row);
  }
}

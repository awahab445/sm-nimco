import { BadRequestException, Injectable } from '@nestjs/common';
import type { StoreSettings } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { isStoreThemeId, normalizeStoreThemeId } from '../constants/themes';

export type PublicThemeSettings = {
  theme: string;
};

export type AdminThemeSettings = PublicThemeSettings & {
  id: string;
  updatedAt: Date;
  updatedByAdminUserId: string | null;
};

@Injectable()
export class StoreSettingsService {
  private readonly singletonId = 'default';
  private readonly defaultTheme = 'tailwind';

  constructor(private readonly prisma: PrismaService) {}

  private toPublic(row: StoreSettings): PublicThemeSettings {
    return {
      theme: normalizeStoreThemeId(row.currentTheme),
    };
  }

  private toAdmin(row: StoreSettings): AdminThemeSettings {
    return {
      ...this.toPublic(row),
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
      },
    });
  }

  async getPublicTheme(): Promise<PublicThemeSettings> {
    const row = await this.ensureDefaults();
    return this.toPublic(row);
  }

  async getAdminTheme(): Promise<AdminThemeSettings> {
    const row = await this.ensureDefaults();
    return this.toAdmin(row);
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

    return this.toAdmin(row);
  }
}

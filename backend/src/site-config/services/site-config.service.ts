import { Injectable } from '@nestjs/common';
import type { SiteConfig } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { UpdateSiteConfigDto } from '../dto/update-site-config.dto';

export type PublicSiteConfig = {
  logoUrl: string | null;
  logoWidth: number;
  logoHeight: number;
  announcementText: string;
  showAnnouncement: boolean;
};

export type AdminSiteConfig = PublicSiteConfig & {
  id: string;
  updatedAt: Date;
  updatedByAdminUserId: string | null;
};

@Injectable()
export class SiteConfigService {
  private readonly singletonId = 'default';
  private readonly defaultLogoWidth = 36;
  private readonly defaultLogoHeight = 36;
  private readonly defaultAnnouncementText =
    'Free Delivery on orders of Rs. 2000 or more!';

  constructor(private readonly prisma: PrismaService) {}

  private normalizeLogoUrl(value: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const isHttpUrl = /^https?:\/\/.+/i.test(trimmed);
    const isAbsolutePath = /^\/.+/.test(trimmed);
    return isHttpUrl || isAbsolutePath ? trimmed : null;
  }

  private toPublic(row: SiteConfig): PublicSiteConfig {
    return {
      logoUrl: this.normalizeLogoUrl(row.logoUrl),
      logoWidth: row.logoWidth,
      logoHeight: row.logoHeight,
      announcementText:
        row.announcementText?.trim() || this.defaultAnnouncementText,
      showAnnouncement: row.showAnnouncement,
    };
  }

  private toAdmin(row: SiteConfig): AdminSiteConfig {
    return {
      ...this.toPublic(row),
      id: row.id,
      updatedAt: row.updatedAt,
      updatedByAdminUserId: row.updatedByAdminUserId,
    };
  }

  async ensureDefaults(): Promise<SiteConfig> {
    return this.prisma.siteConfig.upsert({
      where: { id: this.singletonId },
      update: {},
      create: {
        id: this.singletonId,
        logoWidth: this.defaultLogoWidth,
        logoHeight: this.defaultLogoHeight,
        announcementText: this.defaultAnnouncementText,
        showAnnouncement: false,
      },
    });
  }

  async getPublicConfig(): Promise<PublicSiteConfig> {
    const row = await this.ensureDefaults();
    return this.toPublic(row);
  }

  async getAdminConfig(): Promise<AdminSiteConfig> {
    const row = await this.ensureDefaults();
    return this.toAdmin(row);
  }

  async updateConfig(
    dto: UpdateSiteConfigDto,
    adminUserId?: string,
  ): Promise<AdminSiteConfig> {
    await this.ensureDefaults();
    const row = await this.prisma.siteConfig.update({
      where: { id: this.singletonId },
      data: {
        ...(dto.logoUrl !== undefined && {
          logoUrl:
            dto.logoUrl === null ? null : this.normalizeLogoUrl(dto.logoUrl),
        }),
        ...(dto.logoWidth !== undefined && { logoWidth: dto.logoWidth }),
        ...(dto.logoHeight !== undefined && { logoHeight: dto.logoHeight }),
        ...(dto.announcementText !== undefined && {
          announcementText: dto.announcementText.trim() || null,
        }),
        ...(dto.showAnnouncement !== undefined && {
          showAnnouncement: dto.showAnnouncement,
        }),
        ...(adminUserId && { updatedByAdminUserId: adminUserId }),
      },
    });
    return this.toAdmin(row);
  }
}

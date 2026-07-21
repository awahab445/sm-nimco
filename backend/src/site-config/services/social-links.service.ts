import { Injectable } from '@nestjs/common';
import type { SocialLink } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import {
  ReplaceSocialLinksDto,
  SOCIAL_PLATFORMS,
  type SocialPlatform,
} from '../dto/upsert-social-links.dto';

export type PublicSocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
  sortOrder: number;
};

export type AdminSocialLink = PublicSocialLink & {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class SocialLinksService {
  constructor(private readonly prisma: PrismaService) {}

  private isPlatform(value: string): value is SocialPlatform {
    return (SOCIAL_PLATFORMS as readonly string[]).includes(value);
  }

  private toPublic(row: SocialLink): PublicSocialLink | null {
    if (!this.isPlatform(row.platform)) return null;
    const url = row.url?.trim() ?? '';
    if (!url) return null;
    return {
      id: row.id,
      platform: row.platform,
      url,
      sortOrder: row.sortOrder,
    };
  }

  private toAdmin(row: SocialLink): AdminSocialLink | null {
    if (!this.isPlatform(row.platform)) return null;
    return {
      id: row.id,
      platform: row.platform,
      url: row.url?.trim() ?? '',
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async listPublic(): Promise<PublicSocialLink[]> {
    const rows = await this.prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows
      .map((row) => this.toPublic(row))
      .filter((row): row is PublicSocialLink => Boolean(row));
  }

  async listAdmin(): Promise<AdminSocialLink[]> {
    const rows = await this.prisma.socialLink.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows
      .map((row) => this.toAdmin(row))
      .filter((row): row is AdminSocialLink => Boolean(row));
  }

  /** Replace the full social-links set (add / edit / toggle / delete in one save). */
  async replaceAll(dto: ReplaceSocialLinksDto): Promise<AdminSocialLink[]> {
    const incoming = dto.links ?? [];

    await this.prisma.$transaction(async (tx) => {
      await tx.socialLink.deleteMany({});
      if (incoming.length === 0) return;

      await tx.socialLink.createMany({
        data: incoming.map((link, index) => ({
          platform: link.platform,
          url: link.url.trim(),
          isActive: link.isActive ?? true,
          sortOrder: link.sortOrder ?? index,
        })),
      });
    });

    return this.listAdmin();
  }
}

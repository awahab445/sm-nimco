import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { isPolicyPageSlug } from '../constants/policy-page-slugs';
import { UpsertCmsPageDto } from '../dto/upsert-cms-page.dto';
import { UpsertCmsBlockDto } from '../dto/upsert-cms-block.dto';
import { UpsertCmsSliderDto } from '../dto/upsert-cms-slider.dto';
import { sanitizeCmsHtml } from '../../common/sanitize-html';
import { normalizeCmsUploadImageUrl } from '../../common/normalize-upload-image-url';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  listPages() {
    return this.prisma.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async getPageById(id: string) {
    const page = await this.prisma.cmsPage.findUnique({ where: { id } });
    if (!page) throw new NotFoundException(`CMS page ${id} not found`);
    return page;
  }

  async getPublishedPageBySlug(slug: string) {
    const page = await this.prisma.cmsPage.findFirst({
      where: { slug, status: 'published' },
    });
    if (!page) throw new NotFoundException(`CMS page ${slug} not found`);
    return page;
  }

  async getPageBySlug(slug: string) {
    const page = await this.prisma.cmsPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException(`CMS page ${slug} not found`);
    return page;
  }

  async upsertPageBySlug(
    slug: string,
    dto: {
      title: string;
      contentHtml?: string;
      excerpt?: string;
      metaTitle?: string;
      metaDescription?: string;
    },
  ) {
    if (!isPolicyPageSlug(slug)) {
      throw new BadRequestException(
        'Only policy page slugs can be upserted via this endpoint: shipping-returns, privacy-policy, terms-conditions',
      );
    }

    const contentHtml =
      dto.contentHtml !== undefined ? sanitizeCmsHtml(dto.contentHtml) : undefined;
    const existing = await this.prisma.cmsPage.findUnique({ where: { slug } });

    if (existing) {
      return this.prisma.cmsPage.update({
        where: { slug },
        data: {
          title: dto.title,
          excerpt: dto.excerpt,
          metaTitle: dto.metaTitle ?? dto.title,
          metaDescription: dto.metaDescription ?? dto.excerpt,
          ...(contentHtml !== undefined ? { contentHtml } : {}),
          status: 'published',
          publishedAt: existing.publishedAt ?? new Date(),
        },
      });
    }

    return this.prisma.cmsPage.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        metaTitle: dto.metaTitle ?? dto.title,
        metaDescription: dto.metaDescription ?? dto.excerpt,
        contentHtml,
        contentJson: {},
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }

  createPage(dto: UpsertCmsPageDto) {
    const contentJson = dto.contentJson as Prisma.InputJsonValue | undefined;
    const contentHtml = dto.contentHtml !== undefined ? sanitizeCmsHtml(dto.contentHtml) : undefined;
    return this.prisma.cmsPage.create({
      data: {
        ...dto,
        contentHtml,
        contentJson,
        status: dto.status ?? 'draft',
        publishedAt: dto.status === 'published' ? new Date() : null,
      },
    });
  }

  async updatePage(id: string, dto: Partial<UpsertCmsPageDto>) {
    await this.getPageById(id);
    const data: Prisma.CmsPageUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) data.metaDescription = dto.metaDescription;
    if (dto.contentHtml !== undefined) data.contentHtml = sanitizeCmsHtml(dto.contentHtml);
    if (dto.contentJson !== undefined) {
      data.contentJson = dto.contentJson as Prisma.InputJsonValue;
    }
    if (dto.status === 'published') {
      data.publishedAt = new Date();
    }

    return this.prisma.cmsPage.update({
      where: { id },
      data,
    });
  }

  async deletePage(id: string) {
    await this.getPageById(id);
    await this.prisma.cmsPage.delete({ where: { id } });
  }

  listBlocks() {
    return this.prisma.cmsBlock.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async getBlockById(id: string) {
    const block = await this.prisma.cmsBlock.findUnique({ where: { id } });
    if (!block) throw new NotFoundException(`CMS block ${id} not found`);
    return block;
  }

  async getActiveBlock(identifier: string) {
    const block = await this.prisma.cmsBlock.findFirst({
      where: { identifier, isActive: true },
    });
    if (!block) throw new NotFoundException(`CMS block ${identifier} not found`);
    return block;
  }

  createBlock(dto: UpsertCmsBlockDto) {
    const contentJson = dto.contentJson as Prisma.InputJsonValue | undefined;
    const contentHtml = dto.contentHtml !== undefined ? sanitizeCmsHtml(dto.contentHtml) : undefined;
    return this.prisma.cmsBlock.create({
      data: { ...dto, contentHtml, contentJson, isActive: dto.isActive ?? true },
    });
  }

  async updateBlock(id: string, dto: Partial<UpsertCmsBlockDto>) {
    await this.getBlockById(id);
    const data: Prisma.CmsBlockUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.identifier !== undefined) data.identifier = dto.identifier;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.contentHtml !== undefined) data.contentHtml = sanitizeCmsHtml(dto.contentHtml);
    if (dto.contentJson !== undefined) {
      data.contentJson = dto.contentJson as Prisma.InputJsonValue;
    }

    return this.prisma.cmsBlock.update({
      where: { id },
      data,
    });
  }

  async deleteBlock(id: string) {
    await this.getBlockById(id);
    await this.prisma.cmsBlock.delete({ where: { id } });
  }

  listSliders() {
    return this.prisma.cmsBannerSlider.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { slides: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async getSliderById(id: string) {
    const slider = await this.prisma.cmsBannerSlider.findUnique({
      where: { id },
      include: { slides: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!slider) throw new NotFoundException(`CMS slider ${id} not found`);
    return slider;
  }

  async getActiveSlider(identifier: string) {
    const slider = await this.prisma.cmsBannerSlider.findFirst({
      where: { identifier, isActive: true },
      include: {
        slides: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!slider) throw new NotFoundException(`CMS slider ${identifier} not found`);
    return {
      ...slider,
      slides: slider.slides.map((slide) => ({
        ...slide,
        imageUrl: normalizeCmsUploadImageUrl(slide.imageUrl),
      })),
    };
  }

  async createSlider(dto: UpsertCmsSliderDto) {
    return this.prisma.cmsBannerSlider.create({
      data: {
        name: dto.name,
        identifier: dto.identifier,
        isActive: dto.isActive ?? true,
        autoplayMs: dto.autoplayMs,
        slideWidthPx: dto.slideWidthPx,
        slideHeightPx: dto.slideHeightPx,
        slides: {
          create: dto.slides.map((slide, index) => ({
            ...slide,
            imageUrl: normalizeCmsUploadImageUrl(slide.imageUrl),
            sortOrder: slide.sortOrder ?? index,
            isActive: slide.isActive ?? true,
          })),
        },
      },
      include: { slides: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async updateSlider(id: string, dto: Partial<UpsertCmsSliderDto>) {
    await this.getSliderById(id);
    return this.prisma.$transaction(async (tx) => {
      if (dto.slides) {
        await tx.cmsBannerSlide.deleteMany({ where: { sliderId: id } });
      }
      return tx.cmsBannerSlider.update({
        where: { id },
        data: {
          name: dto.name,
          identifier: dto.identifier,
          isActive: dto.isActive,
          autoplayMs: dto.autoplayMs,
          slideWidthPx: dto.slideWidthPx,
          slideHeightPx: dto.slideHeightPx,
          slides: dto.slides
            ? {
                create: dto.slides.map((slide, index) => ({
                  ...slide,
                  imageUrl: normalizeCmsUploadImageUrl(slide.imageUrl),
                  sortOrder: slide.sortOrder ?? index,
                  isActive: slide.isActive ?? true,
                })),
              }
            : undefined,
        },
        include: { slides: { orderBy: { sortOrder: 'asc' } } },
      });
    });
  }

  async deleteSlider(id: string) {
    await this.getSliderById(id);
    await this.prisma.cmsBannerSlider.delete({ where: { id } });
  }
}

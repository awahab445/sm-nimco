import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import { UpsertCmsPageDto } from '../dto/upsert-cms-page.dto';
import { UpsertCmsBlockDto } from '../dto/upsert-cms-block.dto';
import { UpsertCmsSliderDto } from '../dto/upsert-cms-slider.dto';

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

  createPage(dto: UpsertCmsPageDto) {
    const contentJson = dto.contentJson as Prisma.InputJsonValue | undefined;
    return this.prisma.cmsPage.create({
      data: {
        ...dto,
        contentJson,
        status: dto.status ?? 'draft',
        publishedAt: dto.status === 'published' ? new Date() : null,
      },
    });
  }

  async updatePage(id: string, dto: Partial<UpsertCmsPageDto>) {
    await this.getPageById(id);
    const contentJson = dto.contentJson as Prisma.InputJsonValue | undefined;
    return this.prisma.cmsPage.update({
      where: { id },
      data: {
        ...dto,
        contentJson,
        publishedAt: dto.status === 'published' ? new Date() : undefined,
      },
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
    return this.prisma.cmsBlock.create({
      data: { ...dto, contentJson, isActive: dto.isActive ?? true },
    });
  }

  async updateBlock(id: string, dto: Partial<UpsertCmsBlockDto>) {
    await this.getBlockById(id);
    const contentJson = dto.contentJson as Prisma.InputJsonValue | undefined;
    return this.prisma.cmsBlock.update({ where: { id }, data: { ...dto, contentJson } });
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
    return slider;
  }

  async createSlider(dto: UpsertCmsSliderDto) {
    return this.prisma.cmsBannerSlider.create({
      data: {
        name: dto.name,
        identifier: dto.identifier,
        isActive: dto.isActive ?? true,
        autoplayMs: dto.autoplayMs,
        slides: {
          create: dto.slides.map((slide, index) => ({
            ...slide,
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
          slides: dto.slides
            ? {
                create: dto.slides.map((slide, index) => ({
                  ...slide,
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

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateStorefrontFilterDto } from '../dto/create-storefront-filter.dto';
import { UpdateStorefrontFilterDto } from '../dto/update-storefront-filter.dto';
import { CreateStorefrontFilterOptionDto } from '../dto/create-storefront-filter-option.dto';
import { UpdateStorefrontFilterOptionDto } from '../dto/update-storefront-filter-option.dto';

@Injectable()
export class StorefrontFilterService {
  constructor(private readonly prisma: PrismaService) {}

  /** Models appear on PrismaClient after `npx prisma generate` (restart backend if locked on Windows). */
  private get db(): any {
    return this.prisma;
  }

  async listAllForAdmin() {
    return this.db.storefrontFilter.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      include: {
        options: { orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }] },
      },
    });
  }

  private async assertUniqueKind(kind: string, excludeId?: string): Promise<void> {
    if (kind === 'CATEGORY' || kind === 'PRICE') {
      const existing = await this.db.storefrontFilter.findFirst({
        where: { kind, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      });
      if (existing) {
        throw new ConflictException(`A ${kind} filter already exists. Only one ${kind} filter is allowed.`);
      }
    }
  }

  async createFilter(dto: CreateStorefrontFilterDto) {
    await this.assertUniqueKind(dto.kind);
    const code = dto.code.trim();
    const name = dto.name.trim();
    try {
      return await this.db.storefrontFilter.create({
        data: {
          code,
          name,
          kind: dto.kind,
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
        include: { options: true },
      });
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === 'P2002') {
        throw new ConflictException(`Filter code "${code}" is already in use.`);
      }
      throw e;
    }
  }

  async updateFilter(id: string, dto: UpdateStorefrontFilterDto) {
    const row = await this.db.storefrontFilter.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Filter not found');

    if (dto.code != null && dto.code.trim() !== row.code) {
      const taken = await this.db.storefrontFilter.findFirst({
        where: { code: dto.code.trim(), NOT: { id } },
      });
      if (taken) throw new ConflictException(`Code "${dto.code.trim()}" is already in use.`);
    }

    try {
      return await this.db.storefrontFilter.update({
        where: { id },
        data: {
          ...(dto.code !== undefined ? { code: dto.code.trim() } : {}),
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
        include: { options: { orderBy: [{ sortOrder: 'asc' }, { value: 'asc' }] } },
      });
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === 'P2002') {
        throw new ConflictException('That filter code is already in use.');
      }
      throw e;
    }
  }

  async deleteFilter(id: string) {
    const row = await this.db.storefrontFilter.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Filter not found');
    await this.db.storefrontFilter.delete({ where: { id } });
    return { id };
  }

  async createOption(filterId: string, dto: CreateStorefrontFilterOptionDto) {
    const filter = await this.db.storefrontFilter.findUnique({ where: { id: filterId } });
    if (!filter) throw new NotFoundException('Filter not found');
    if (filter.kind !== 'ATTRIBUTE') {
      throw new BadRequestException('Options can only be added to ATTRIBUTE filters.');
    }
    const value = dto.value.trim();
    if (!value) throw new BadRequestException('value is required');
    try {
      return await this.db.storefrontFilterOption.create({
        data: {
          filterId,
          value,
          label: dto.label?.trim() || null,
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === 'P2002') {
        throw new ConflictException(`Option value "${value}" already exists for this filter.`);
      }
      throw e;
    }
  }

  async updateOption(optionId: string, dto: UpdateStorefrontFilterOptionDto) {
    const opt = await this.db.storefrontFilterOption.findUnique({
      where: { id: optionId },
      include: { filter: true },
    });
    if (!opt) throw new NotFoundException('Option not found');
    const nextVal = dto.value !== undefined ? dto.value.trim() : opt.value;
    if (dto.value !== undefined && !nextVal) throw new BadRequestException('value cannot be empty');
    try {
      return await this.db.storefrontFilterOption.update({
        where: { id: optionId },
        data: {
          ...(dto.value !== undefined ? { value: nextVal } : {}),
          ...(dto.label !== undefined ? { label: dto.label?.trim() || null } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === 'P2002') {
        throw new ConflictException('That option value already exists for this filter.');
      }
      throw e;
    }
  }

  async deleteOption(optionId: string) {
    const opt = await this.db.storefrontFilterOption.findUnique({ where: { id: optionId } });
    if (!opt) throw new NotFoundException('Option not found');
    await this.db.storefrontFilterOption.delete({ where: { id: optionId } });
    return { id: optionId };
  }
}

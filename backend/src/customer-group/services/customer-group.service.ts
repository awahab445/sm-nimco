import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { CreateCustomerGroupDto } from '../dto/create-customer-group.dto';
import { UpdateCustomerGroupDto } from '../dto/update-customer-group.dto';
import { QueryCustomerGroupDto } from '../dto/query-customer-group.dto';

@Injectable()
export class CustomerGroupService {
  private readonly logger = new Logger(CustomerGroupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new customer group
   */
  async create(dto: CreateCustomerGroupDto) {
    // If setting as default, ensure no other group is default
    if (dto.isDefault) {
      await this.unsetDefaultGroup();
    }

    const customerGroup = await this.prisma.customerGroup.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        isDefault: dto.isDefault || false,
        taxClassId: dto.taxClassId || null,
        discountPercent:
          dto.discountPercent !== undefined ? dto.discountPercent : null,
        metadata: dto.metadata || {},
      },
    });

    this.logger.log(`Created customer group: ${customerGroup.id} (${customerGroup.name})`);
    return this.mapToResponse(customerGroup);
  }

  /**
   * Get all customer groups
   */
  async findAll(query?: QueryCustomerGroupDto) {
    const where: any = {};

    if (query?.isDefault !== undefined) {
      where.isDefault = query.isDefault;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const groups = await this.prisma.customerGroup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { customers: true } },
      },
    });

    return groups.map((g) => this.mapToResponse(g));
  }

  /**
   * Get customer group by ID
   */
  async findOne(id: string) {
    const group = await this.prisma.customerGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: { customers: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Customer group ${id} not found`);
    }

    return this.mapToResponse(group);
  }

  /**
   * Get the default customer group
   */
  async findDefault() {
    const group = await this.prisma.customerGroup.findFirst({
      where: { isDefault: true },
    });

    if (!group) {
      throw new NotFoundException('No default customer group found');
    }

    return this.mapToResponse(group);
  }

  /**
   * Update customer group
   */
  async update(id: string, dto: UpdateCustomerGroupDto) {
    const existing = await this.prisma.customerGroup.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Customer group ${id} not found`);
    }

    // If setting as default, ensure no other group is default
    if (dto.isDefault === true && !existing.isDefault) {
      await this.unsetDefaultGroup();
    }

    // If unsetting default, ensure at least one group remains default
    if (dto.isDefault === false && existing.isDefault) {
      const otherGroups = await this.prisma.customerGroup.findMany({
        where: { id: { not: id } },
      });
      if (otherGroups.length === 0) {
        throw new BadRequestException('Cannot unset default group when it is the only group');
      }
      // Set the first other group as default
      await this.prisma.customerGroup.update({
        where: { id: otherGroups[0].id },
        data: { isDefault: true },
      });
    }

    const updated = await this.prisma.customerGroup.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault,
        taxClassId: dto.taxClassId,
        discountPercent: dto.discountPercent,
        metadata: dto.metadata,
      },
    });

    this.logger.log(`Updated customer group: ${id}`);
    return this.mapToResponse(updated);
  }

  /**
   * Delete customer group
   */
  async delete(id: string) {
    const existing = await this.prisma.customerGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: { customers: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Customer group ${id} not found`);
    }

    // Check if group has customers
    if (existing._count.customers > 0) {
      throw new BadRequestException(
        `Cannot delete customer group ${id}: it has ${existing._count.customers} customer(s)`,
      );
    }

    // If deleting default group, set another group as default
    if (existing.isDefault) {
      const otherGroup = await this.prisma.customerGroup.findFirst({
        where: { id: { not: id } },
      });
      if (otherGroup) {
        await this.prisma.customerGroup.update({
          where: { id: otherGroup.id },
          data: { isDefault: true },
        });
      }
    }

    await this.prisma.customerGroup.delete({
      where: { id },
    });

    this.logger.log(`Deleted customer group: ${id}`);
  }

  /**
   * Unset default flag from all groups
   */
  private async unsetDefaultGroup() {
    await this.prisma.customerGroup.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  /**
   * Map Prisma model to response format
   */
  private mapToResponse(group: any) {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      isDefault: group.isDefault,
      taxClassId: group.taxClassId,
      discountPercent: group.discountPercent
        ? parseFloat(group.discountPercent.toString())
        : null,
      metadata: group.metadata,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      ...(group._count && { customerCount: group._count.customers }),
    };
  }
}


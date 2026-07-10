import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../catalog/services/prisma.service';
import { TaxClass, Tax } from '../entities/tax-class.entity';
import { CreateTaxClassDto } from '../dto/create-tax-class.dto';
import { CreateTaxDto } from '../dto/create-tax.dto';
import { TaxUpdatedEvent } from '../events/tax.events';

@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a tax class
   */
  async createTaxClass(dto: CreateTaxClassDto): Promise<TaxClass> {
    // Check if code already exists
    const existing = await this.prisma.taxClass.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException(
        `Tax class with code '${dto.code}' already exists`,
      );
    }

    const taxClass = await this.prisma.taxClass.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description || null,
        metadata: dto.metadata || {},
      },
    });

    this.logger.log(`Tax class created: ${taxClass.id} (${taxClass.code})`);
    return taxClass as unknown as TaxClass;
  }

  /**
   * Get all tax classes
   */
  async findAllTaxClasses(): Promise<TaxClass[]> {
    return (await this.prisma.taxClass.findMany({
      orderBy: { code: 'asc' },
    })) as unknown as TaxClass[];
  }

  /**
   * Get tax class by ID
   */
  async findTaxClassById(id: string): Promise<TaxClass> {
    const taxClass = await this.prisma.taxClass.findUnique({
      where: { id },
    });

    if (!taxClass) {
      throw new NotFoundException(`Tax class with ID ${id} not found`);
    }

    return taxClass as unknown as TaxClass;
  }

  /**
   * Get tax class by code
   */
  async findTaxClassByCode(code: string): Promise<TaxClass | null> {
    const taxClass = await this.prisma.taxClass.findUnique({
      where: { code },
    });

    return taxClass as unknown as TaxClass | null;
  }

  /**
   * Update tax class
   */
  async updateTaxClass(
    id: string,
    dto: Partial<CreateTaxClassDto>,
  ): Promise<TaxClass> {
    // Check if tax class exists
    await this.findTaxClassById(id);

    // If updating code, check for conflicts
    if (dto.code) {
      const existing = await this.prisma.taxClass.findUnique({
        where: { code: dto.code },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Tax class with code '${dto.code}' already exists`,
        );
      }
    }

    const taxClass = await this.prisma.taxClass.update({
      where: { id },
      data: {
        ...(dto.code && { code: dto.code }),
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && {
          description: dto.description || null,
        }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata || {} }),
      },
    });

    this.logger.log(`Tax class updated: ${taxClass.id}`);
    return taxClass as unknown as TaxClass;
  }

  /**
   * Delete tax class
   */
  async deleteTaxClass(id: string): Promise<void> {
    // Check if tax class exists
    await this.findTaxClassById(id);

    // Check if any taxes are using this class
    const taxCount = await this.prisma.tax.count({
      where: { taxClassId: id },
    });

    if (taxCount > 0) {
      throw new BadRequestException(
        `Cannot delete tax class: ${taxCount} tax(es) are using this class`,
      );
    }

    await this.prisma.taxClass.delete({
      where: { id },
    });

    this.logger.log(`Tax class deleted: ${id}`);
  }

  /**
   * Create a tax
   */
  async createTax(dto: CreateTaxDto): Promise<Tax> {
    // Validate tax class exists
    await this.findTaxClassById(dto.taxClassId);

    // Validate date range
    if (
      dto.startDate &&
      dto.endDate &&
      new Date(dto.startDate) > new Date(dto.endDate)
    ) {
      throw new BadRequestException('Start date must be before end date');
    }

    const tax = await this.prisma.tax.create({
      data: {
        taxClassId: dto.taxClassId,
        country: dto.country,
        region: dto.region || null,
        rate: dto.rate,
        isInclusive: dto.isInclusive ?? false,
        isActive: dto.isActive ?? true,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        metadata: dto.metadata || {},
      },
    });

    this.logger.log(
      `Tax created: ${tax.id} (${dto.country}${dto.region ? `, ${dto.region}` : ''} - ${dto.rate}%)`,
    );
    return this.mapTaxFromPrisma(tax);
  }

  /**
   * Get all taxes
   */
  async findAllTaxes(): Promise<Tax[]> {
    const taxes = await this.prisma.tax.findMany({
      include: { taxClass: true },
      orderBy: [{ country: 'asc' }, { region: 'asc' }, { rate: 'desc' }],
    });

    return taxes.map((t) => this.mapTaxFromPrisma(t));
  }

  /**
   * Get tax by ID
   */
  async findTaxById(id: string): Promise<Tax> {
    const tax = await this.prisma.tax.findUnique({
      where: { id },
      include: { taxClass: true },
    });

    if (!tax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }

    return this.mapTaxFromPrisma(tax);
  }

  /**
   * Find applicable taxes for a location and tax class
   */
  async findApplicableTaxes(
    country: string,
    region: string | null | undefined,
    taxClassId: string | null,
  ): Promise<Tax[]> {
    const now = new Date();

    const taxes = await this.prisma.tax.findMany({
      where: {
        country,
        ...(region && { region }),
        ...(taxClassId && { taxClassId }),
        isActive: true,
        AND: [
          {
            OR: [{ startDate: null }, { startDate: { lte: now } }],
          },
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
        ],
      },
      include: { taxClass: true },
      orderBy: { rate: 'desc' },
    });

    return taxes.map((t) => this.mapTaxFromPrisma(t));
  }

  /**
   * Update tax
   */
  async updateTax(id: string, dto: Partial<CreateTaxDto>): Promise<Tax> {
    const existingTax = await this.findTaxById(id);

    // Validate date range if both are being updated
    if (dto.startDate !== undefined && dto.endDate !== undefined) {
      const startDate = dto.startDate
        ? new Date(dto.startDate)
        : existingTax.startDate;
      const endDate = dto.endDate ? new Date(dto.endDate) : existingTax.endDate;
      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const tax = await this.prisma.tax.update({
      where: { id },
      data: {
        ...(dto.taxClassId && { taxClassId: dto.taxClassId }),
        ...(dto.country && { country: dto.country }),
        ...(dto.region !== undefined && { region: dto.region || null }),
        ...(dto.rate !== undefined && { rate: dto.rate }),
        ...(dto.isInclusive !== undefined && { isInclusive: dto.isInclusive }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.startDate !== undefined && {
          startDate: dto.startDate ? new Date(dto.startDate) : null,
        }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata || {} }),
      },
      include: { taxClass: true },
    });

    // Emit event
    this.eventEmitter.emit(
      'tax.updated',
      new TaxUpdatedEvent(tax.id, tax.taxClassId, {
        ...(dto.rate !== undefined && { rate: Number(tax.rate) }),
        ...(dto.isActive !== undefined && { isActive: tax.isActive }),
        ...(dto.startDate !== undefined && { startDate: tax.startDate }),
        ...(dto.endDate !== undefined && { endDate: tax.endDate }),
      }),
    );

    this.logger.log(`Tax updated: ${tax.id}`);
    return this.mapTaxFromPrisma(tax);
  }

  /**
   * Delete tax
   */
  async deleteTax(id: string): Promise<void> {
    await this.findTaxById(id);

    await this.prisma.tax.delete({
      where: { id },
    });

    this.logger.log(`Tax deleted: ${id}`);
  }

  /**
   * Map Prisma tax to Tax entity
   */
  private mapTaxFromPrisma(tax: any): Tax {
    return {
      id: tax.id,
      taxClassId: tax.taxClassId,
      country: tax.country,
      region: tax.region,
      rate: Number(tax.rate),
      isInclusive: tax.isInclusive,
      isActive: tax.isActive,
      startDate: tax.startDate,
      endDate: tax.endDate,
      metadata: tax.metadata as Record<string, any>,
      createdAt: tax.createdAt,
      updatedAt: tax.updatedAt,
    };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { CustomerGroupService } from '../../customer-group/services/customer-group.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { QueryCustomerDto } from '../dto/query-customer.dto';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly customerGroupService: CustomerGroupService,
  ) {}

  /**
   * Create a new customer
   * Automatically assigns default group if customerGroupId is not provided
   */
  async create(dto: CreateCustomerDto) {
    // Check if customer with email already exists
    const existing = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException(
        `Customer with email ${dto.email} already exists`,
      );
    }

    // Get customer group (use provided or default)
    let customerGroupId: string;
    if (dto.customerGroupId) {
      // Verify group exists
      await this.customerGroupService.findOne(dto.customerGroupId);
      customerGroupId = dto.customerGroupId;
    } else {
      // Use default group
      const defaultGroup = await this.customerGroupService.findDefault();
      customerGroupId = defaultGroup.id;
    }

    const customer = await this.prisma.customer.create({
      data: {
        email: dto.email,
        firstName: dto.firstName || null,
        lastName: dto.lastName || null,
        phone: dto.phone || null,
        isGuest: dto.isGuest || false,
        customerGroupId,
        metadata: dto.metadata || {},
      },
      include: {
        customerGroup: true,
      },
    });

    this.logger.log(`Created customer: ${customer.id} (${customer.email})`);
    return this.mapToResponse(customer);
  }

  /**
   * Get all customers
   */
  async findAll(query?: QueryCustomerDto) {
    const where: any = {};

    if (query?.isGuest !== undefined) {
      where.isGuest = query.isGuest;
    }

    if (query?.customerGroupId) {
      where.customerGroupId = query.customerGroupId;
    }

    if (query?.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const customers = await this.prisma.customer.findMany({
      where,
      include: {
        customerGroup: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return customers.map((c) => this.mapToResponse(c));
  }

  /**
   * Get customer by ID
   */
  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        customerGroup: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }

    return this.mapToResponse(customer);
  }

  /**
   * Get customer by email
   */
  async findByEmail(email: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
      include: {
        customerGroup: true,
      },
    });

    if (!customer) {
      return null;
    }

    return this.mapToResponse(customer);
  }

  /**
   * Get current authenticated customer's profile
   */
  async findMe(customerId: string) {
    return this.findOne(customerId);
  }

  /**
   * Update current authenticated customer's profile
   * Only allows updating: email, firstName, lastName, phone
   * Does not allow updating: customerGroupId, isGuest, metadata (admin-only fields)
   */
  async updateMe(customerId: string, dto: UpdateCustomerDto) {
    // Build update data with only allowed fields
    const updateData: Partial<UpdateCustomerDto> = {};

    if (dto.email !== undefined) {
      updateData.email = dto.email;
    }
    if (dto.firstName !== undefined) {
      updateData.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      updateData.lastName = dto.lastName;
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone;
    }

    return this.update(customerId, updateData);
  }

  /**
   * Get or create customer by email (useful for guest checkout)
   * If customer doesn't exist, creates a guest customer with default group
   */
  async getOrCreateByEmail(email: string, isGuest: boolean = true) {
    let customer = await this.findByEmail(email);

    if (!customer) {
      // Create guest customer with default group
      const defaultGroup = await this.customerGroupService.findDefault();
      const newCustomer = await this.prisma.customer.create({
        data: {
          email,
          isGuest: isGuest,
          customerGroupId: defaultGroup.id,
          metadata: {},
        },
        include: {
          customerGroup: true,
        },
      });
      customer = this.mapToResponse(newCustomer);
      this.logger.log(`Created guest customer: ${newCustomer.id} (${email})`);
    }

    return customer;
  }

  /**
   * Update customer
   */
  async update(id: string, dto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Customer ${id} not found`);
    }

    // If email is being updated, check for conflicts
    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.prisma.customer.findUnique({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new BadRequestException(
          `Customer with email ${dto.email} already exists`,
        );
      }
    }

    // If customerGroupId is being updated, verify group exists
    if (dto.customerGroupId) {
      await this.customerGroupService.findOne(dto.customerGroupId);
    }

    // Build update data object with only defined fields
    const updateData: any = {};
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.isGuest !== undefined) updateData.isGuest = dto.isGuest;
    if (dto.customerGroupId !== undefined)
      updateData.customerGroupId = dto.customerGroupId;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

    const updated = await this.prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        customerGroup: true,
      },
    });

    this.logger.log(`Updated customer: ${id}`);
    return this.mapToResponse(updated);
  }

  /**
   * Assign customer to a group
   */
  async assignGroup(customerId: string, groupId: string) {
    // Verify group exists
    await this.customerGroupService.findOne(groupId);

    const customer = await this.prisma.customer.update({
      where: { id: customerId },
      data: { customerGroupId: groupId },
      include: {
        customerGroup: true,
      },
    });

    this.logger.log(`Assigned customer ${customerId} to group ${groupId}`);
    return this.mapToResponse(customer);
  }

  /**
   * Delete customer
   */
  async delete(id: string) {
    const existing = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Customer ${id} not found`);
    }

    await this.prisma.customer.delete({
      where: { id },
    });

    this.logger.log(`Deleted customer: ${id}`);
  }

  /**
   * Map Prisma model to response format
   */
  private mapToResponse(customer: any) {
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      isGuest: customer.isGuest,
      isEmailVerified: customer.isEmailVerified ?? false,
      customerGroupId: customer.customerGroupId,
      customerGroup: customer.customerGroup
        ? {
            id: customer.customerGroup.id,
            name: customer.customerGroup.name,
            isDefault: customer.customerGroup.isDefault,
            taxClassId: customer.customerGroup.taxClassId,
            discountPercent: customer.customerGroup.discountPercent
              ? parseFloat(customer.customerGroup.discountPercent.toString())
              : null,
          }
        : null,
      metadata: customer.metadata,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}

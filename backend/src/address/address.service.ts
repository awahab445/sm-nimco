import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../catalog/services/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all addresses for a customer.
   */
  async findAll(customerId: string) {
    return this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [
        { isDefaultBilling: 'desc' },
        { isDefaultShipping: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get one address by id. Ensures it belongs to the customer.
   */
  async findOne(customerId: string, id: string) {
    const address = await this.prisma.customerAddress.findFirst({
      where: { id, customerId },
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  /**
   * Create a new address for the customer.
   * If isDefaultBilling or isDefaultShipping is true, clears other defaults.
   */
  async create(customerId: string, dto: CreateAddressDto) {
    if (dto.isDefaultBilling) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefaultBilling: false },
      });
    }
    if (dto.isDefaultShipping) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefaultShipping: false },
      });
    }

    return this.prisma.customerAddress.create({
      data: {
        customerId,
        label: dto.label ?? null,
        firstName: dto.firstName,
        lastName: dto.lastName,
        company: dto.company ?? null,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2 ?? null,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country.toUpperCase(),
        phone: dto.phone ?? null,
        isDefaultBilling: dto.isDefaultBilling ?? false,
        isDefaultShipping: dto.isDefaultShipping ?? false,
      },
    });
  }

  /**
   * Update an address. Ensures it belongs to the customer.
   * If setting isDefaultBilling or isDefaultShipping, clears other defaults.
   */
  async update(customerId: string, id: string, dto: UpdateAddressDto) {
    await this.findOne(customerId, id);

    if (dto.isDefaultBilling === true) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId, id: { not: id } },
        data: { isDefaultBilling: false },
      });
    }
    if (dto.isDefaultShipping === true) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId, id: { not: id } },
        data: { isDefaultShipping: false },
      });
    }

    return this.prisma.customerAddress.update({
      where: { id },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.company !== undefined && { company: dto.company }),
        ...(dto.addressLine1 !== undefined && { addressLine1: dto.addressLine1 }),
        ...(dto.addressLine2 !== undefined && { addressLine2: dto.addressLine2 }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
        ...(dto.country !== undefined && {
          country: dto.country.toUpperCase(),
        }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.isDefaultBilling !== undefined && {
          isDefaultBilling: dto.isDefaultBilling,
        }),
        ...(dto.isDefaultShipping !== undefined && {
          isDefaultShipping: dto.isDefaultShipping,
        }),
      },
    });
  }

  /**
   * Delete an address. Ensures it belongs to the customer.
   */
  async remove(customerId: string, id: string) {
    await this.findOne(customerId, id);
    await this.prisma.customerAddress.delete({ where: { id } });
    return { message: 'Address deleted' };
  }

  /**
   * Set an address as the default billing address for the customer.
   */
  async setDefaultBilling(customerId: string, id: string) {
    await this.findOne(customerId, id);
    await this.prisma.customerAddress.updateMany({
      where: { customerId },
      data: { isDefaultBilling: false },
    });
    return this.prisma.customerAddress.update({
      where: { id },
      data: { isDefaultBilling: true },
    });
  }

  /**
   * Set an address as the default shipping address for the customer.
   */
  async setDefaultShipping(customerId: string, id: string) {
    await this.findOne(customerId, id);
    await this.prisma.customerAddress.updateMany({
      where: { customerId },
      data: { isDefaultShipping: false },
    });
    return this.prisma.customerAddress.update({
      where: { id },
      data: { isDefaultShipping: true },
    });
  }
}

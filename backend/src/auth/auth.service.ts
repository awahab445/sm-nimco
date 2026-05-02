import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../catalog/services/prisma.service';
import { CustomerService } from '../customer/services/customer.service';
import { CustomerGroupService } from '../customer-group/services/customer-group.service';
import { MailService } from './mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isGuest: boolean;
    customerGroupId: string;
    customerGroup?: {
      id: string;
      name: string;
      isDefault: boolean;
      taxClassId?: string;
      discountPercent?: number;
    };
    createdAt: string;
    updatedAt: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly customerService: CustomerService,
    private readonly customerGroupService: CustomerGroupService,
    private readonly mailService: MailService,
  ) {}

  private readonly SALT_ROUNDS = 10;

  /**
   * Validate customer by email and password. Returns customer entity or null.
   */
  async validateUser(email: string, password: string): Promise<any | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { customerGroup: true },
    });

    if (!customer || !customer.passwordHash) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      return null;
    }

    return customer;
  }

  /**
   * Login: validate credentials and return JWT + user profile.
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const customer = await this.validateUser(loginDto.email, loginDto.password);

    if (!customer) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(customer);
  }

  /**
   * Register: create new customer with password, or convert guest to registered.
   * Returns JWT + user profile.
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const email = registerDto.email.toLowerCase().trim();
    const existing = await this.prisma.customer.findUnique({
      where: { email },
      include: { customerGroup: true },
    });

    if (existing) {
      if (existing.passwordHash) {
        throw new BadRequestException(
          'An account with this email already exists. Please sign in.',
        );
      }
      // Guest without password: convert to registered
      const passwordHash = await bcrypt.hash(
        registerDto.password,
        this.SALT_ROUNDS,
      );
      const updated = await this.prisma.customer.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          isGuest: false,
          firstName: registerDto.firstName ?? existing.firstName,
          lastName: registerDto.lastName ?? existing.lastName,
          phone: registerDto.phone ?? existing.phone,
        },
        include: { customerGroup: true },
      });
      this.logger.log(`Converted guest to registered: ${updated.id} (${email})`);
      return this.buildAuthResponse(updated);
    }

    // New customer
    const defaultGroup = await this.customerGroupService.findDefault();
    const passwordHash = await bcrypt.hash(
      registerDto.password,
      this.SALT_ROUNDS,
    );
    const customer = await this.prisma.customer.create({
      data: {
        email,
        passwordHash,
        firstName: registerDto.firstName ?? null,
        lastName: registerDto.lastName ?? null,
        phone: registerDto.phone ?? null,
        isGuest: false,
        customerGroupId: defaultGroup.id,
        metadata: {},
      },
      include: { customerGroup: true },
    });
    this.logger.log(`Registered customer: ${customer.id} (${email})`);
    return this.buildAuthResponse(customer);
  }

  /**
   * Logout: stateless JWT - client discards token. Return success for API consistency.
   */
  async logout(): Promise<{ message: string }> {
    return { message: 'Logged out successfully' };
  }

  /**
   * Request account creation for a guest customer (same email as order).
   * Creates a one-time token, persists it, and sends email with set-password link.
   */
  async requestAccountCreation(email: string): Promise<{ message: string }> {
    const normalized = email.toLowerCase().trim();
    const customer = await this.prisma.customer.findUnique({
      where: { email: normalized },
    });

    if (!customer) {
      this.logger.warn(`requestAccountCreation: no customer for ${normalized}`);
      return { message: 'If an order was placed with this email, you will receive a link to create your password.' };
    }

    if (!customer.isGuest || customer.passwordHash) {
      this.logger.warn(`requestAccountCreation: not a guest or already has password: ${normalized}`);
      return { message: 'If an order was placed with this email, you will receive a link to create your password.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.accountCreationToken.deleteMany({
      where: { email: normalized },
    });
    await this.prisma.accountCreationToken.create({
      data: { email: normalized, token, expiresAt },
    });

    await this.mailService.sendAccountCreationLink(normalized, token);
    this.logger.log(`Account creation token created for ${normalized}`);
    return { message: 'If an order was placed with this email, you will receive a link to create your password.' };
  }

  /**
   * Set password using one-time token (from email link). Converts guest to registered and returns JWT.
   */
  async setPasswordWithToken(token: string, password: string): Promise<AuthResponse> {
    const record = await this.prisma.accountCreationToken.findUnique({
      where: { token },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired link. Please request a new one.');
    }

    if (new Date() > record.expiresAt) {
      await this.prisma.accountCreationToken.delete({ where: { id: record.id } }).catch(() => {});
      throw new BadRequestException('This link has expired. Please request a new one.');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { email: record.email },
      include: { customerGroup: true },
    });

    if (!customer || !customer.isGuest) {
      await this.prisma.accountCreationToken.delete({ where: { id: record.id } }).catch(() => {});
      throw new BadRequestException('Invalid or expired link. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash, isGuest: false },
      include: { customerGroup: true },
    });

    await this.prisma.accountCreationToken.delete({ where: { id: record.id } }).catch(() => {});

    this.logger.log(`Guest converted to registered via set-password: ${updated.id} (${record.email})`);
    return this.buildAuthResponse(updated);
  }

  /**
   * Get current user profile by customer id (from JWT). Used by GET /auth/me.
   */
  async getProfile(customerId: string) {
    return this.customerService.findMe(customerId);
  }

  private buildAuthResponse(customer: any): AuthResponse {
    const payload: JwtPayload = {
      sub: customer.id,
      email: customer.email,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName ?? undefined,
        lastName: customer.lastName ?? undefined,
        phone: customer.phone ?? undefined,
        isGuest: customer.isGuest,
        customerGroupId: customer.customerGroupId,
        customerGroup: customer.customerGroup
          ? {
              id: customer.customerGroup.id,
              name: customer.customerGroup.name,
              isDefault: customer.customerGroup.isDefault,
              taxClassId: customer.customerGroup.taxClassId ?? undefined,
              discountPercent: customer.customerGroup.discountPercent
                ? parseFloat(customer.customerGroup.discountPercent.toString())
                : undefined,
            }
          : undefined,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
    };
  }
}

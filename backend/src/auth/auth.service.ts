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
import { EmailService } from '../mail/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type JwtPrincipalType = 'customer' | 'admin' | 'vendor';

/** JWT claims. Omit `typ` for legacy customer tokens (treated as customer). */
export interface JwtPayload {
  sub: string;
  email: string;
  typ?: JwtPrincipalType;
  /** Staff claim for Flutter JwtService (`SUPER_ADMIN` | `STORE_OPERATOR` | …). */
  role?: string;
  /** Optional store scope when multi-store / configured via env. */
  storeId?: string;
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
    isEmailVerified: boolean;
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

export interface RegisterPendingResponse {
  message: string;
  email: string;
  requiresEmailVerification: true;
}

export interface VerifyEmailResponse extends AuthResponse {
  message: string;
  verified: true;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly customerService: CustomerService,
    private readonly customerGroupService: CustomerGroupService,
    private readonly emailService: EmailService,
  ) {}

  private readonly SALT_ROUNDS = 10;

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private displayName(customer: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
  }): string {
    return (
      [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
      customer.email
    );
  }

  private async sendVerificationForCustomer(
    customerId: string,
    email: string,
    userName: string,
  ): Promise<void> {
    const token = this.generateVerificationToken();
    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        isEmailVerified: false,
        emailVerificationToken: token,
      },
    });
    await this.emailService.sendEmailVerificationEmail(email, userName, token);
  }

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

    if (!customer.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before signing in. Check your inbox for the verification link.',
      );
    }

    return this.buildAuthResponse(customer);
  }

  /**
   * Register: create new customer with password, or convert guest to registered.
   * Sends a verification email; account is activated after email is confirmed.
   */
  async register(registerDto: RegisterDto): Promise<RegisterPendingResponse> {
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
          isEmailVerified: false,
          emailVerificationToken: null,
        },
        include: { customerGroup: true },
      });
      this.logger.log(
        `Converted guest to registered (pending verification): ${updated.id} (${email})`,
      );
      await this.sendVerificationForCustomer(
        updated.id,
        email,
        this.displayName(updated),
      );
      return {
        message:
          'Registration successful. Please check your email to verify your account before signing in.',
        email,
        requiresEmailVerification: true,
      };
    }

    const defaultGroup = await this.customerGroupService.findDefault();
    const passwordHash = await bcrypt.hash(
      registerDto.password,
      this.SALT_ROUNDS,
    );
    const verificationToken = this.generateVerificationToken();
    const customer = await this.prisma.customer.create({
      data: {
        email,
        passwordHash,
        firstName: registerDto.firstName ?? null,
        lastName: registerDto.lastName ?? null,
        phone: registerDto.phone ?? null,
        isGuest: false,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        customerGroupId: defaultGroup.id,
        metadata: {},
      },
      include: { customerGroup: true },
    });
    this.logger.log(
      `Registered customer (pending verification): ${customer.id} (${email})`,
    );
    await this.emailService.sendEmailVerificationEmail(
      email,
      this.displayName(customer),
      verificationToken,
    );
    return {
      message:
        'Registration successful. Please check your email to verify your account before signing in.',
      email,
      requiresEmailVerification: true,
    };
  }

  /**
   * Verify email using the token from the verification link.
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const normalizedToken = token?.trim();
    if (!normalizedToken) {
      throw new BadRequestException('Verification token is required.');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { emailVerificationToken: normalizedToken },
      include: { customerGroup: true },
    });

    if (!customer) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    if (customer.isEmailVerified) {
      const auth = this.buildAuthResponse(customer);
      return {
        message: 'Email is already verified. Your account is active.',
        verified: true,
        ...auth,
      };
    }

    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
      include: { customerGroup: true },
    });

    this.logger.log(
      `Email verified for customer: ${updated.id} (${updated.email})`,
    );
    void this.emailService.sendWelcomeEmail(
      updated.email,
      this.displayName(updated),
    );

    const auth = this.buildAuthResponse(updated);
    return {
      message: 'Email verified successfully. Your account is now active.',
      verified: true,
      ...auth,
    };
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
      return {
        message:
          'If an order was placed with this email, you will receive a link to create your password.',
      };
    }

    if (!customer.isGuest || customer.passwordHash) {
      this.logger.warn(
        `requestAccountCreation: not a guest or already has password: ${normalized}`,
      );
      return {
        message:
          'If an order was placed with this email, you will receive a link to create your password.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.accountCreationToken.deleteMany({
      where: { email: normalized },
    });
    await this.prisma.accountCreationToken.create({
      data: { email: normalized, token, expiresAt },
    });

    await this.emailService.sendAccountCreationLink(normalized, token);
    this.logger.log(`Account creation token created for ${normalized}`);
    return {
      message:
        'If an order was placed with this email, you will receive a link to create your password.',
    };
  }

  /**
   * Set password using one-time token (from email link). Converts guest to registered and returns JWT.
   */
  async setPasswordWithToken(
    token: string,
    password: string,
  ): Promise<AuthResponse> {
    const record = await this.prisma.accountCreationToken.findUnique({
      where: { token },
    });

    if (!record) {
      throw new BadRequestException(
        'Invalid or expired link. Please request a new one.',
      );
    }

    if (new Date() > record.expiresAt) {
      await this.prisma.accountCreationToken
        .delete({ where: { id: record.id } })
        .catch(() => {});
      throw new BadRequestException(
        'This link has expired. Please request a new one.',
      );
    }

    const customer = await this.prisma.customer.findUnique({
      where: { email: record.email },
      include: { customerGroup: true },
    });

    if (!customer || !customer.isGuest) {
      await this.prisma.accountCreationToken
        .delete({ where: { id: record.id } })
        .catch(() => {});
      throw new BadRequestException(
        'Invalid or expired link. Please request a new one.',
      );
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordHash,
        isGuest: false,
        isEmailVerified: true,
        emailVerificationToken: null,
      },
      include: { customerGroup: true },
    });

    await this.prisma.accountCreationToken
      .delete({ where: { id: record.id } })
      .catch(() => {});

    this.logger.log(
      `Guest converted to registered via set-password: ${updated.id} (${record.email})`,
    );
    return this.buildAuthResponse(updated);
  }

  /**
   * Request a password reset link for a registered customer.
   * Always returns a generic message to avoid email enumeration.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const normalized = email.toLowerCase().trim();
    const genericMessage =
      'If an account exists with this email, you will receive a password reset link shortly.';

    const customer = await this.prisma.customer.findUnique({
      where: { email: normalized },
    });

    if (!customer || !customer.passwordHash) {
      this.logger.warn(
        `forgotPassword: no registered account for ${normalized}`,
      );
      return { message: genericMessage };
    }

    const token = this.generateVerificationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expiresAt,
      },
    });

    await this.emailService.sendPasswordResetEmail(
      normalized,
      this.displayName(customer),
      token,
    );
    this.logger.log(`Password reset token created for ${normalized}`);

    return { message: genericMessage };
  }

  /**
   * Reset password using a valid, non-expired token from the email link.
   */
  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    const normalizedToken = token?.trim();
    if (!normalizedToken) {
      throw new BadRequestException('Reset token is required.');
    }

    const customer = await this.prisma.customer.findFirst({
      where: {
        resetPasswordToken: normalizedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!customer) {
      throw new BadRequestException('Token invalid or expired.');
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    this.logger.log(
      `Password reset for customer: ${customer.id} (${customer.email})`,
    );

    return {
      message:
        'Your password has been reset successfully. You can now sign in.',
    };
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
      typ: 'customer',
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
        isEmailVerified: customer.isEmailVerified ?? false,
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

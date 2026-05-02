import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../catalog/services/prisma.service';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { FirstAdminBootstrapDto } from '../dto/first-admin-bootstrap.dto';
import { SUPER_ADMIN_ROLE_SLUG } from '../constants/permissions';
import { ensureAdminRbacSeeded } from '../seed/ensure-admin-rbac';

@Injectable()
export class AdminUserService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAdminUserDto, _createdByAdminId: string) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An admin user with this email already exists');
    }

    const roles = await this.prisma.adminRole.findMany({
      where: { id: { in: dto.roleIds } },
    });
    if (roles.length !== dto.roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        roles: {
          create: dto.roleIds.map((roleId) => ({ roleId })),
        },
      },
      include: {
        roles: { include: { role: { select: { id: true, slug: true, name: true } } } },
      },
    });

    return this.serializeUser(user);
  }

  async validateCredentials(email: string, password: string) {
    const normalized = email.toLowerCase().trim();
    const user = await this.prisma.adminUser.findUnique({
      where: { email: normalized },
      include: {
        roles: { include: { role: { select: { id: true, slug: true, name: true } } } },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return null;
    }

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      include: {
        roles: { include: { role: { select: { id: true, slug: true, name: true } } } },
      },
    });
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }
    return user;
  }

  serializeUser(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    roles: { role: { id: string; slug: string; name: string } }[];
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      roles: user.roles.map((r) => r.role),
    };
  }

  async getSuperAdminRoleId(): Promise<string> {
    let role = await this.prisma.adminRole.findUnique({
      where: { slug: SUPER_ADMIN_ROLE_SLUG },
    });
    if (!role) {
      await ensureAdminRbacSeeded(this.prisma);
      role = await this.prisma.adminRole.findUnique({
        where: { slug: SUPER_ADMIN_ROLE_SLUG },
      });
    }
    if (!role) {
      throw new BadRequestException(
        'Super-admin role is missing. Apply migration 20260502120000_admin_rbac and ensure the database is reachable.',
      );
    }
    return role.id;
  }

  async bootstrapFirstSuperAdmin(dto: FirstAdminBootstrapDto) {
    const n = await this.prisma.adminUser.count();
    if (n > 0) {
      throw new BadRequestException('A staff user already exists.');
    }
    const superRoleId = await this.getSuperAdminRoleId();
    return this.create(
      {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleIds: [superRoleId],
      },
      'bootstrap',
    );
  }
}

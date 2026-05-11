import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../catalog/services/prisma.service';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dto/update-admin-user.dto';
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

  async listAll() {
    const users = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        roles: { include: { role: { select: { id: true, slug: true, name: true } } } },
      },
    });
    return users.map((u) => this.serializeUser(u));
  }

  /**
   * Update an admin user. Supports partial changes to names, active flag,
   * password reset, and full role-set replacement. Enforces self-lock guards.
   */
  async update(id: string, dto: UpdateAdminUserDto, actorId: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      include: { roles: { include: { role: { select: { slug: true } } } } },
    });
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    const isSelf = actorId === id;

    if (isSelf && dto.isActive === false) {
      throw new ForbiddenException('You cannot deactivate your own account.');
    }

    if (dto.roleIds) {
      const roles = await this.prisma.adminRole.findMany({
        where: { id: { in: dto.roleIds } },
        select: { id: true, slug: true },
      });
      if (roles.length !== dto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }

      if (isSelf) {
        const userIsSuper = user.roles.some(
          (r) => r.role.slug === SUPER_ADMIN_ROLE_SLUG,
        );
        const stillSuper = roles.some((r) => r.slug === SUPER_ADMIN_ROLE_SLUG);
        if (userIsSuper && !stillSuper) {
          throw new ForbiddenException(
            'You cannot remove your own super-admin role.',
          );
        }
      }
    }

    const data: {
      firstName?: string | null;
      lastName?: string | null;
      isActive?: boolean;
      passwordHash?: string;
    } = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName || null;
    if (dto.lastName !== undefined) data.lastName = dto.lastName || null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.adminUser.update({ where: { id }, data });
      }
      if (dto.roleIds) {
        await tx.adminUserRole.deleteMany({ where: { userId: id } });
        await tx.adminUserRole.createMany({
          data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
        });
      }
      return tx.adminUser.findUniqueOrThrow({
        where: { id },
        include: {
          roles: { include: { role: { select: { id: true, slug: true, name: true } } } },
        },
      });
    });

    return this.serializeUser(updated);
  }

  async remove(id: string, actorId: string) {
    if (id === actorId) {
      throw new BadRequestException('You cannot delete your own account.');
    }
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }
    await this.prisma.adminUser.delete({ where: { id } });
    return { id, deleted: true };
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

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../catalog/services/prisma.service';

export const USER_BLOCKED_MESSAGE = 'USER_BLOCKED';

export type SessionListItem = {
  userId: string;
  email: string;
  name: string;
  role: string | null;
  ipAddress: string | null;
  deviceInfo: string | null;
  lastActiveAt: string;
  isBlocked: boolean;
  status: 'active' | 'blocked';
};

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  /** Client IP from Express (trust proxy) or X-Forwarded-For. */
  resolveClientIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return forwarded.split(',')[0]?.trim() || null;
    }
    if (Array.isArray(forwarded) && forwarded[0]) {
      return forwarded[0].split(',')[0]?.trim() || null;
    }
    const ip = req.ip || req.socket?.remoteAddress;
    return ip?.trim() || null;
  }

  resolveDeviceInfo(req: Request): string | null {
    const explicit =
      (typeof req.headers['x-device-info'] === 'string'
        ? req.headers['x-device-info']
        : null) ||
      (typeof req.headers['x-device-id'] === 'string'
        ? req.headers['x-device-id']
        : null);
    if (explicit?.trim()) {
      return explicit.trim().slice(0, 512);
    }
    const ua =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : null;
    return ua?.trim().slice(0, 512) || null;
  }

  assertNotBlocked(isBlocked: boolean): void {
    if (isBlocked) {
      throw new ForbiddenException({ message: USER_BLOCKED_MESSAGE });
    }
  }

  async ping(
    userId: string,
    req: Request,
  ): Promise<{ status: 'active' | 'blocked'; isBlocked: boolean }> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: { id: true, isBlocked: true, isActive: true },
    });
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    this.assertNotBlocked(user.isBlocked);

    const ipAddress = this.resolveClientIp(req);
    const deviceInfo = this.resolveDeviceInfo(req);
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.adminUser.update({
        where: { id: userId },
        data: {
          lastIp: ipAddress ?? undefined,
        },
      }),
      this.prisma.sessionLog.upsert({
        where: { userId },
        create: {
          userId,
          ipAddress,
          deviceInfo,
          lastActiveAt: now,
          isBlocked: false,
        },
        update: {
          ipAddress: ipAddress ?? undefined,
          deviceInfo: deviceInfo ?? undefined,
          lastActiveAt: now,
          isBlocked: false,
        },
      }),
    ]);

    return { status: 'active', isBlocked: false };
  }

  async listSessions(): Promise<SessionListItem[]> {
    const rows = await this.prisma.sessionLog.findMany({
      orderBy: { lastActiveAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isBlocked: true,
            roles: {
              include: {
                role: { select: { slug: true, name: true } },
              },
            },
          },
        },
      },
    });

    return rows.map((row) => {
      const blocked = row.user.isBlocked || row.isBlocked;
      const primaryRole = row.user.roles[0]?.role;
      const name =
        [row.user.firstName, row.user.lastName].filter(Boolean).join(' ') ||
        row.user.email;
      return {
        userId: row.userId,
        email: row.user.email,
        name,
        role: primaryRole?.name ?? primaryRole?.slug ?? null,
        ipAddress: row.ipAddress,
        deviceInfo: row.deviceInfo,
        lastActiveAt: row.lastActiveAt.toISOString(),
        isBlocked: blocked,
        status: blocked ? 'blocked' : 'active',
      };
    });
  }

  /**
   * Toggle block on the admin user and mirror onto their session log.
   * Blocked users fail JWT validation / vendor guards (JWT effectively revoked).
   */
  async setBlocked(
    userId: string,
    isBlocked: boolean,
  ): Promise<SessionListItem> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.$transaction([
      this.prisma.adminUser.update({
        where: { id: userId },
        data: { isBlocked },
      }),
      this.prisma.sessionLog.upsert({
        where: { userId },
        create: {
          userId,
          isBlocked,
          lastActiveAt: new Date(),
        },
        update: { isBlocked },
      }),
    ]);

    const [item] = await this.listSessionsForUser(userId);
    if (!item) {
      throw new NotFoundException('Session not found after update');
    }
    return item;
  }

  private async listSessionsForUser(userId: string): Promise<SessionListItem[]> {
    const all = await this.listSessions();
    return all.filter((s) => s.userId === userId);
  }
}

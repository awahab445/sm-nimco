import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { PrismaService } from '../../catalog/services/prisma.service';
import type { JwtPayload } from '../auth.service';
import {
  ADMIN_AUTH_COOKIE,
  CUSTOMER_AUTH_COOKIE,
} from '../../common/auth-cookies';

import { STORE_OPERATOR_ROLE_SLUG } from '../../admin/constants/permissions';

export type JwtValidatePayload =
  | {
      typ: 'customer';
      customerId: string;
      email: string;
      sub: string;
    }
  | {
      typ: 'admin';
      adminUserId: string;
      email: string;
      sub: string;
      role?: string;
      storeId?: string;
    }
  | {
      typ: 'vendor';
      vendorUserId: string;
      email: string;
      sub: string;
      role?: string;
      storeId?: string;
    };

/** Use on routes protected by vendor JWT (store operator mobile app). */
export type VendorJwtPayload = Extract<JwtValidatePayload, { typ: 'vendor' }>;

/** Use on routes protected by {@link CustomerJwtAuthGuard}. */
export type CustomerJwtPayload = Extract<
  JwtValidatePayload,
  { typ: 'customer' }
>;

function extractJwtFromRequest(req: Request): string | null {
  const bearer = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (bearer) {
    return bearer;
  }
  const cookies = (req as Request & { cookies?: Record<string, string> })
    .cookies;
  if (!cookies) {
    return null;
  }
  return cookies[CUSTOMER_AUTH_COOKIE] || cookies[ADMIN_AUTH_COOKIE] || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: extractJwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change-me-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtValidatePayload> {
    const typ = payload.typ ?? 'customer';

    if (typ === 'admin') {
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
      });
      if (!admin || !admin.isActive) {
        throw new UnauthorizedException(
          'Admin user is inactive or no longer exists',
        );
      }
      return {
        typ: 'admin',
        adminUserId: admin.id,
        email: admin.email,
        sub: admin.id,
        ...(payload.role ? { role: payload.role } : {}),
        ...(payload.storeId ? { storeId: payload.storeId } : {}),
      };
    }

    if (typ === 'vendor') {
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
        include: {
          roles: { include: { role: { select: { slug: true } } } },
        },
      });
      if (!admin || !admin.isActive) {
        throw new UnauthorizedException(
          'Store operator is inactive or no longer exists',
        );
      }
      const isStoreOperator = admin.roles.some(
        (entry) => entry.role.slug === STORE_OPERATOR_ROLE_SLUG,
      );
      if (!isStoreOperator) {
        throw new UnauthorizedException('Store operator access required');
      }
      return {
        typ: 'vendor',
        vendorUserId: admin.id,
        email: admin.email,
        sub: admin.id,
        ...(payload.role ? { role: payload.role } : {}),
        ...(payload.storeId ? { storeId: payload.storeId } : {}),
      };
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
    });

    if (!customer) {
      throw new UnauthorizedException('User no longer exists');
    }

    return {
      typ: 'customer',
      customerId: payload.sub,
      email: payload.email,
      sub: payload.sub,
    };
  }
}

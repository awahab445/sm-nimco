import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../catalog/services/prisma.service';
import type { JwtPayload } from '../auth.service';

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
    };

/** Use on routes protected by {@link CustomerJwtAuthGuard}. */
export type CustomerJwtPayload = Extract<JwtValidatePayload, { typ: 'customer' }>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
        throw new UnauthorizedException('Admin user is inactive or no longer exists');
      }
      return {
        typ: 'admin',
        adminUserId: admin.id,
        email: admin.email,
        sub: admin.id,
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

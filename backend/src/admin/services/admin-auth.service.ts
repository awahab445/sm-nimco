import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../../auth/auth.service';
import { AdminUserService } from './admin-user.service';
import { AdminRbacService } from './admin-rbac.service';
import { LoginDto } from '../../auth/dto/login.dto';

export interface AdminAuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    typ: 'admin';
    roles: { id: string; slug: string; name: string }[];
    permissions: string[];
  };
}

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly rbac: AdminRbacService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AdminAuthResponse> {
    const user = await this.adminUserService.validateCredentials(
      dto.email,
      dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      typ: 'admin',
    };
    const access_token = this.jwtService.sign(payload);
    const permissions = await this.rbac.getEffectivePermissionKeys(user.id);

    return {
      access_token,
      user: {
        ...this.adminUserService.serializeUser(user),
        typ: 'admin',
        permissions,
      },
    };
  }

  async me(adminUserId: string): Promise<AdminAuthResponse['user']> {
    const user = await this.adminUserService.findById(adminUserId);
    const permissions = await this.rbac.getEffectivePermissionKeys(adminUserId);
    return {
      ...this.adminUserService.serializeUser(user),
      typ: 'admin',
      permissions,
    };
  }

  logoutMessage() {
    return { message: 'Logged out successfully' };
  }
}

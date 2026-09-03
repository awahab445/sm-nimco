import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../../auth/auth.service';
import { LoginDto } from '../../auth/dto/login.dto';
import { AdminUserService } from '../../admin/services/admin-user.service';
import { STORE_OPERATOR_ROLE_SLUG } from '../../admin/constants/permissions';

export interface StoreLoginResponse {
  accessToken: string;
}

@Injectable()
export class StoreAuthService {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly jwtService: JwtService,
  ) {}

  async storeLogin(dto: LoginDto): Promise<StoreLoginResponse> {
    const user = await this.adminUserService.validateCredentials(
      dto.email,
      dto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isStoreOperator = user.roles.some(
      (entry) => entry.role.slug === STORE_OPERATOR_ROLE_SLUG,
    );
    if (!isStoreOperator) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      typ: 'vendor',
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}

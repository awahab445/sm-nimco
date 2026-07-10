import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CustomerJwtAuthGuard } from './guards/customer-jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { CatalogModule } from '../catalog/catalog.module';
import { CustomerGroupModule } from '../customer-group/customer-group.module';
import { CustomerModule } from '../customer/customer.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-me-in-production',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ??
          '7d') as import('ms').StringValue,
      },
    }),
    CatalogModule,
    CustomerGroupModule,
    forwardRef(() => CustomerModule),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    CustomerJwtAuthGuard,
    OptionalJwtAuthGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtAuthGuard,
    CustomerJwtAuthGuard,
    OptionalJwtAuthGuard,
  ],
})
export class AuthModule {}

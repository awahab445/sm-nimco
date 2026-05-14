import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';

const WEAK_SECRETS = new Set([
  'change-me-in-production',
  'change-me-use-a-long-random-string',
  'your-secret-key',
  'secret',
]);

/** Comma-separated in CORS_ORIGIN, e.g. storefront + admin: http://localhost:3001,http://localhost:3002 */
function corsOriginsFromEnv(): string | string[] {
  const fallback = 'http://localhost:3001,http://localhost:3002';
  const raw = process.env.CORS_ORIGIN?.trim() || fallback;
  const list = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (list.length === 0) {
    return fallback.split(',')[0].trim();
  }
  return list.length === 1 ? list[0] : list;
}

function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret || WEAK_SECRETS.has(jwtSecret) || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set to a strong value (32+ chars) in production.');
  }

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL must be set in production.');
  }

  if (!process.env.CORS_ORIGIN?.trim()) {
    throw new Error('CORS_ORIGIN must be set in production.');
  }

  if (!process.env.PUBLIC_BASE_URL?.trim()) {
    throw new Error('PUBLIC_BASE_URL must be set in production.');
  }

  if (process.env.REDIS_ENABLED === 'false') {
    throw new Error(
      'REDIS_ENABLED=false is not allowed in production. Enable Redis for cart/checkout persistence.',
    );
  }
}

async function bootstrap() {
  validateProductionEnv();

  const app = await NestFactory.create(AppModule, { rawBody: true });
  const uploadsRoot = join(process.cwd(), 'uploads');
  const productUploadsDir = join(uploadsRoot, 'products');
  const cmsSlideUploadsDir = join(uploadsRoot, 'cms-slides');
  const storefrontNavUploadsDir = join(uploadsRoot, 'storefront-nav');
  if (!existsSync(productUploadsDir)) {
    mkdirSync(productUploadsDir, { recursive: true });
  }
  if (!existsSync(cmsSlideUploadsDir)) {
    mkdirSync(cmsSlideUploadsDir, { recursive: true });
  }
  if (!existsSync(storefrontNavUploadsDir)) {
    mkdirSync(storefrontNavUploadsDir, { recursive: true });
  }

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  app.use('/uploads', express.static(uploadsRoot));

  app.enableCors({
    origin: corsOriginsFromEnv(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

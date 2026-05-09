import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';

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

async function bootstrap() {
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-in-production')
  ) {
    throw new Error('JWT_SECRET must be set in production.');
  }

  const app = await NestFactory.create(AppModule);
  const uploadsRoot = join(process.cwd(), 'uploads');
  const productUploadsDir = join(uploadsRoot, 'products');
  const cmsSlideUploadsDir = join(uploadsRoot, 'cms-slides');
  if (!existsSync(productUploadsDir)) {
    mkdirSync(productUploadsDir, { recursive: true });
  }
  if (!existsSync(cmsSlideUploadsDir)) {
    mkdirSync(cmsSlideUploadsDir, { recursive: true });
  }
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

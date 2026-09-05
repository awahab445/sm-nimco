import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { promises as fs } from 'fs'; // Dynamic async FS operations
import { AppModule } from './app.module';

const WEAK_SECRETS = new Set([
  'change-me-in-production',
  'change-me-use-a-long-random-string',
  'your-secret-key',
  'secret',
]);

/** Comma-separated browser origins supporting array format natively */
function corsOriginsFromEnv(): string | string[] {
  const fallback = ['http://localhost:3001', 'http://localhost:3002'];
  const raw = process.env.CORS_ORIGIN?.trim();

  if (!raw) return fallback;

  const list = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return list.length === 0 ? fallback : list.length === 1 ? list[0] : list;
}

function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret || WEAK_SECRETS.has(jwtSecret) || jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be set to a strong value (32+ chars) in production.',
    );
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

  // Local testing bypass ke liye optional check (Aapki setup ke mutabiq filhal commented hai)
  // if (process.env.REDIS_ENABLED === 'false') {
  //   throw new Error('REDIS_ENABLED=false is not allowed in production.');
  // }
}

async function bootstrap() {
  validateProductionEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  // Needed so req.ip reflects X-Forwarded-For behind reverse proxies.
  app.set('trust proxy', 1);

  // Create directories asynchronously (Non-blocking)
  const uploadsRoot = join(process.cwd(), 'uploads');
  const uploadDirs = [
    join(uploadsRoot, 'products'),
    join(uploadsRoot, 'cms-slides'),
    join(uploadsRoot, 'storefront-nav'),
    join(uploadsRoot, 'site-config'),
    join(uploadsRoot, 'deals'),
  ];

  for (const dir of uploadDirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  // Security Middlewares
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  // UUID-named upload files are immutable; long cache helps LCP/repeat visits.
  app.use(
    '/uploads',
    express.static(uploadsRoot, {
      maxAge: '30d',
      immutable: true,
      etag: true,
      lastModified: true,
    }),
  );

  // CORS Setup
  app.enableCors({
    origin: corsOriginsFromEnv(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // Dynamic headers allow karne ke liye allowedHeaders hata diya hai taake common packages break na hon
  });

  // Global DTO Validation Pipes
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

bootstrap().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});

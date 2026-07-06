import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { AppModule } from './app.module';
import { getCorsOrigins, validateSecurityConfig } from './config/env';

async function bootstrap() {
  validateSecurityConfig();

  const publicUploadDir = join(process.cwd(), 'uploads', 'public');
  const privateUploadDir = join(process.cwd(), 'uploads', 'private');
  mkdirSync(publicUploadDir, { recursive: true });
  mkdirSync(privateUploadDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  const corsOrigins = getCorsOrigins();
  app.enableCors(
    corsOrigins
      ? { origin: corsOrigins, credentials: true }
      : { origin: false },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');
    next();
  });

  app.useStaticAssets(publicUploadDir, { prefix: '/api/uploads/' });

  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`ACM API listening on http://localhost:${port}/api`);
}

void bootstrap();

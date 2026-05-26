import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('app.nodeEnv');
  const port = configService.get<number>('app.port', 3001);
  const webUrl = configService.get<string>('app.webUrl', 'http://localhost:5173');

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
  }));

  app.use(cookieParser());

  // CORS — whitelist known origins
  app.enableCors({
    origin: [
      webUrl,
      'http://localhost:5173',
      'http://localhost:3000',
      'https://metrivahomes.com',
      'https://www.metrivahomes.com',
      'https://admin.metrivahomes.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // API versioning
  app.enableVersioning({ type: VersioningType.URI });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes — validate all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // strip unknown props
      forbidNonWhitelisted: true,
      transform: true,          // auto-transform types (string → number, etc.)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger (dev/staging only)
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Metriva Homes API')
      .setDescription('Metriva Technologies — Real Estate Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('properties', 'Property CRUD & search')
      .addTag('ai', 'AI trust scoring & insights')
      .addTag('payments', 'Razorpay payment flows')
      .addTag('admin', 'Admin moderation')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: 'Metriva API Docs',
    });
  }

  await app.listen(port);
  console.log(`🏠 Metriva API running on: http://localhost:${port}/api`);
  if (nodeEnv !== 'production') {
    console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
  }
}

bootstrap();

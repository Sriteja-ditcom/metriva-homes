import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { BullModule } from '@nestjs/bull';

import configuration from './config/configuration';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { SearchModule } from './modules/search/search.module';
import { AiModule } from './modules/ai/ai.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { AdminModule } from './modules/admin/admin.module';
import { BrokersModule } from './modules/brokers/brokers.module';
import { BuildersModule } from './modules/builders/builders.module';
import { LocalitiesModule } from './modules/localities/localities.module';

@Module({
  imports: [
    // Config — global, loads .env
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Rate limiting — Redis-backed for multi-instance deployments
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [
          { name: 'global', ttl: 15 * 60 * 1000, limit: 100 },
          { name: 'auth', ttl: 15 * 60 * 1000, limit: 10 },
        ],
      }),
    }),

    // Redis cache — global
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        url: config.get<string>('redis.url'),
        ttl: 60 * 1000, // default 60s in ms
      }),
    }),

    // Bull queue — async job processing (AI scoring, notifications, emails)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('redis.url'),
      }),
    }),

    // Feature modules
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    SearchModule,
    AiModule,
    PaymentsModule,
    NotificationsModule,
    FraudModule,
    AdminModule,
    BrokersModule,
    BuildersModule,
    LocalitiesModule,
  ],
})
export class AppModule {}

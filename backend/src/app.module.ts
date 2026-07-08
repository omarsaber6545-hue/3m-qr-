import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './prisma/prisma.module';
import { LogsModule } from './logs/logs.module';
import { StorageModule } from './storage/storage.module';
import { QrModule } from './qr/qr.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { PaymentsModule } from './payments/payments.module';
import { ProjectsModule } from './projects/projects.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    // Configurations
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    // Security: Rate Limiting (100 requests per 15 minutes by default)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Queue system using BullMQ with Redis
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          return {
            connection: {
              url: redisUrl,
            },
          };
        }
        return {
          connection: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD', undefined),
          },
        };
      },
    }),

    // Global Core Modules
    PrismaModule,
    LogsModule,
    StorageModule,
    QrModule,
    WebsocketModule,

    // Domain Modules
    AuthModule,
    AiModule,
    PaymentsModule,
    ProjectsModule,
    AdminModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiService } from './ai.service';
import { AiProcessor } from './ai.processor';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'ai-generation',
    }),
  ],
  providers: [AiService, AiProcessor],
  exports: [AiService, BullModule],
})
export class AiModule {}

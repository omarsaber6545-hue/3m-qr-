import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { QrModule } from '../qr/qr.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-generation',
    }),
    QrModule,
    StorageModule,
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}

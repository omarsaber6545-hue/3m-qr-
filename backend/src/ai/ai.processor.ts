import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AiService } from './ai.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import axios from 'axios';

@Processor('ai-generation')
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private aiService: AiService,
    private websocketGateway: WebsocketGateway
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { projectId, userId, prompt, negativePrompt, originalQrUrl, controlWeight, guidanceScale, numSteps } = job.data;
    
    this.logger.log(`Processing AI QR generation job ${job.id} for Project ${projectId}`);
    
    // 1. Notify user of status update: GENERATING
    this.websocketGateway.sendProjectUpdate(userId, {
      projectId,
      status: 'GENERATING',
      progress: 25,
    });

    try {
      // Update db project status
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'GENERATING' },
      });

      // 2. Call AI service to generate art
      this.websocketGateway.sendProjectUpdate(userId, {
        projectId,
        status: 'GENERATING',
        progress: 50,
      });

      const aiImageUrl = await this.aiService.generateArtisticQr(originalQrUrl, prompt, negativePrompt, {
        controlWeight,
        guidanceScale,
        numSteps,
      });

      // 3. Download generated image and upload to permanent storage
      this.websocketGateway.sendProjectUpdate(userId, {
        projectId,
        status: 'GENERATING',
        progress: 75,
      });

      this.logger.log(`Downloading generated image from AI service: ${aiImageUrl}`);
      
      let finalStorageUrl = aiImageUrl;

      try {
        const response = await axios.get(aiImageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        
        const timestamp = Date.now();
        const filename = `ai_qr_${projectId}_${timestamp}.png`;
        
        finalStorageUrl = await this.storage.uploadFile(buffer, 'generated-qr', filename, 'image/png');
        this.logger.log(`Uploaded generated image to permanent storage: ${finalStorageUrl}`);
      } catch (err) {
        this.logger.error('Failed to upload image to storage. Using direct URL from generator.', err.message);
      }

      // 4. Update database
      const updatedProject = await this.prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'COMPLETED',
          generatedQrUrl: finalStorageUrl,
        },
      });

      // Deduct credit from user
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });

      // 5. Broadcast success status
      this.websocketGateway.sendProjectUpdate(userId, {
        projectId,
        status: 'COMPLETED',
        progress: 100,
        generatedQrUrl: finalStorageUrl,
      });

      this.logger.log(`Job complete. Project ${projectId} marked COMPLETED.`);
      return { success: true, project: updatedProject };

    } catch (error) {
      this.logger.error(`Error processing job ${job.id}`, error.stack);
      
      // Update database status
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'FAILED',
          errorMsg: error.message || 'Unknown processing error',
        },
      });

      // Broadcast failure
      this.websocketGateway.sendProjectUpdate(userId, {
        projectId,
        status: 'FAILED',
        progress: 100,
        error: error.message || 'Processing failed',
      });

      throw error;
    }
  }
}

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrService } from '../qr/qr.service';
import { StorageService } from '../storage/storage.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private prisma: PrismaService,
    private qrService: QrService,
    private storage: StorageService,
    @InjectQueue('ai-generation') private aiQueue: Queue
  ) {}

  /**
   * Creates a standard or AI-assisted QR code project.
   */
  async createProject(userId: string, data: any): Promise<any> {
    const { name, qrType, qrData, isAiProject, prompt, negativePrompt, styleId, controlWeight, guidanceScale, numSteps } = data;

    // Check credits if AI generation is requested
    if (isAiProject) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.credits <= 0) {
        throw new BadRequestException('Insufficient credits. Please upgrade your plan or purchase more credits.');
      }
    }

    // 1. Format raw data depending on type and generate standard QR buffer
    const formattedText = this.qrService.formatQrData(qrType, qrData);
    const qrBuffer = await this.qrService.generateQrBuffer(formattedText, {
      errorCorrectionLevel: isAiProject ? 'H' : 'M', // High correction for AI QR, Medium for standard
    });

    // 2. Upload standard QR to storage
    const timestamp = Date.now();
    const originalFilename = `raw_qr_${userId}_${timestamp}.png`;
    const originalQrUrl = await this.storage.uploadFile(qrBuffer, 'original-qr', originalFilename, 'image/png');

    // 3. Create Project in Database
    const project = await this.prisma.project.create({
      data: {
        name: name || `QR Code Project ${timestamp}`,
        qrType,
        qrData: typeof qrData === 'object' ? JSON.stringify(qrData) : qrData,
        originalQrUrl,
        prompt: isAiProject ? prompt : null,
        negativePrompt: isAiProject ? negativePrompt : null,
        styleId: isAiProject ? styleId : null,
        controlWeight: isAiProject && controlWeight !== undefined ? parseFloat(controlWeight) : 0.95,
        guidanceScale: isAiProject && guidanceScale !== undefined ? parseFloat(guidanceScale) : 7.5,
        numSteps: isAiProject && numSteps !== undefined ? parseInt(numSteps, 10) : 30,
        status: isAiProject ? 'PENDING' : 'COMPLETED',
        generatedQrUrl: isAiProject ? null : originalQrUrl, // Standard QRs don't run through AI, generated is same as original
        userId,
      },
    });

    // 4. If AI Project, enqueue job
    if (isAiProject) {
      await this.aiQueue.add('ai-generation', {
        projectId: project.id,
        userId,
        prompt,
        negativePrompt,
        originalQrUrl,
        controlWeight: project.controlWeight,
        guidanceScale: project.guidanceScale,
        numSteps: project.numSteps,
      });
      this.logger.log(`Enqueued AI generation job for Project: ${project.id}`);
    }

    return project;
  }

  /**
   * Retrieves all projects belonging to user.
   */
  async getUserProjects(userId: string, filters: any = {}): Promise<any> {
    const { isFavorite, search, limit = 10, offset = 0 } = filters;
    const where: any = { userId };

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite === 'true' || isFavorite === true;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const projects = await this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
      include: { style: true },
    });

    const total = await this.prisma.project.count({ where });

    return { projects, total };
  }

  /**
   * Get single project details.
   */
  async getProjectDetails(userId: string, id: string): Promise<any> {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: { style: true, collection: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  /**
   * Delete project.
   */
  async deleteProject(userId: string, id: string): Promise<any> {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Toggles favorite status.
   */
  async toggleFavorite(userId: string, id: string): Promise<any> {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.project.update({
      where: { id },
      data: { isFavorite: !project.isFavorite },
    });
  }

  /**
   * Add / Remove project to/from a Collection.
   */
  async assignCollection(userId: string, projectId: string, collectionId: string | null): Promise<any> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (collectionId) {
      const collection = await this.prisma.collection.findFirst({
        where: { id: collectionId, userId },
      });
      if (!collection) {
        throw new NotFoundException('Collection not found');
      }
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: { collectionId },
    });
  }

  // --- Collections CRUD ---

  async createCollection(userId: string, data: { name: string; description?: string }): Promise<any> {
    return this.prisma.collection.create({
      data: {
        name: data.name,
        description: data.description,
        userId,
      },
    });
  }

  async getCollections(userId: string): Promise<any> {
    return this.prisma.collection.findMany({
      where: { userId },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });
  }

  async deleteCollection(userId: string, id: string): Promise<any> {
    const collection = await this.prisma.collection.findFirst({
      where: { id, userId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    await this.prisma.collection.delete({ where: { id } });
    return { success: true };
  }
}

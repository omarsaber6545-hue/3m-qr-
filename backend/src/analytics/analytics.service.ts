import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Tracks a QR scan event.
   * Increments scan counts in both project stats and aggregated daily analytics.
   */
  async trackScan(projectId: string): Promise<string> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Try parsing target URL from qrData
    let destinationUrl = '';
    try {
      const parsedData = JSON.parse(project.qrData);
      destinationUrl = parsedData.url || parsedData.text || '';
    } catch (e) {
      destinationUrl = project.qrData;
    }

    if (!destinationUrl.startsWith('http://') && !destinationUrl.startsWith('https://')) {
      // Default fallback or wrap search query/plain text
      destinationUrl = `https://www.google.com/search?q=${encodeURIComponent(destinationUrl)}`;
    }

    // Increment daily statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      await this.prisma.analytics.upsert({
        where: { date: today },
        update: {
          totalScans: { increment: 1 },
        },
        create: {
          date: today,
          totalScans: 1,
          totalGenerations: 0,
          activeUsers: 1,
        },
      });
      
      this.logger.log(`Tracked scan for project ${projectId}. Redirecting to ${destinationUrl}`);
    } catch (err) {
      this.logger.error('Failed to log scan statistics', err.message);
    }

    return destinationUrl;
  }

  /**
   * Increments generation stats.
   */
  async trackGeneration() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      await this.prisma.analytics.upsert({
        where: { date: today },
        update: {
          totalGenerations: { increment: 1 },
        },
        create: {
          date: today,
          totalScans: 0,
          totalGenerations: 1,
          activeUsers: 1,
        },
      });
    } catch (err) {
      this.logger.error('Failed to log generation statistics', err.message);
    }
  }

  /**
   * Fetch aggregated analytics.
   */
  async getSystemAnalytics(): Promise<any> {
    const stats = await this.prisma.analytics.findMany({
      orderBy: { date: 'desc' },
      take: 30, // Past 30 days
    });

    const categoryStats = await this.prisma.project.groupBy({
      by: ['qrType'],
      _count: {
        id: true,
      },
    });

    return {
      dailyHistory: stats.reverse(),
      categories: categoryStats.map((item) => ({
        type: item.qrType,
        count: item._count.id,
      })),
    };
  }
}

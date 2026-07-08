import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('ai-generation') private aiQueue: Queue
  ) {}

  /**
   * Retrieves high-level dashboard metrics for admins.
   */
  async getDashboardStats(): Promise<any> {
    const totalUsers = await this.prisma.user.count();
    const totalProjects = await this.prisma.project.count();
    
    // Sum payments
    const payments = await this.prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      select: { amount: true },
    });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // AI Generation Queue lengths
    const activeJobs = await this.aiQueue.getActiveCount();
    const waitingJobs = await this.aiQueue.getWaitingCount();
    const failedJobs = await this.aiQueue.getFailedCount();

    // Latest system logs
    const latestLogs = await this.prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      stats: {
        totalUsers,
        totalProjects,
        totalRevenue,
        queue: {
          active: activeJobs,
          waiting: waitingJobs,
          failed: failedJobs,
        },
      },
      latestLogs,
    };
  }

  // --- Users Admin ---

  async getUsers(limit = 50, offset = 0): Promise<any> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
        status: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        credits: true,
        createdAt: true,
      },
    });
    const total = await this.prisma.user.count();
    return { users, total };
  }

  async updateUserRole(id: string, role: 'USER' | 'ADMIN'): Promise<any> {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async updateUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<any> {
    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async updateUserCredits(id: string, credits: number): Promise<any> {
    return this.prisma.user.update({
      where: { id },
      data: { credits },
    });
  }

  // --- Projects Audit ---

  async getProjects(limit = 50, offset = 0): Promise<any> {
    const projects = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });
    const total = await this.prisma.project.count();
    return { projects, total };
  }

  // --- Payments Auditing ---

  async getPayments(limit = 50, offset = 0): Promise<any> {
    const payments = await this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });
    const total = await this.prisma.payment.count();
    return { payments, total };
  }

  // --- Styles Admin ---

  async createStyle(data: any): Promise<any> {
    return this.prisma.aIStyle.create({
      data: {
        name: data.name,
        promptTemplate: data.promptTemplate,
        negativePromptTemplate: data.negativePromptTemplate,
        controlWeight: parseFloat(data.controlWeight || '0.95'),
        guidanceScale: parseFloat(data.guidanceScale || '7.5'),
        numSteps: parseInt(data.numSteps || '30', 10),
        previewUrl: data.previewUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
        isCustom: false,
      },
    });
  }

  async getStyles(): Promise<any> {
    return this.prisma.aIStyle.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async deleteStyle(id: string): Promise<any> {
    return this.prisma.aIStyle.delete({ where: { id } });
  }

  // --- System Logs Audit ---

  async getSystemLogs(limit = 100, offset = 0, level?: string): Promise<any> {
    const where: any = {};
    if (level) {
      where.level = level;
    }
    const logs = await this.prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    const total = await this.prisma.systemLog.count({ where });
    return { logs, total };
  }
}

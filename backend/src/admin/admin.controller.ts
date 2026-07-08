import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private adminService: AdminService) {}

  private checkAdmin(user: any) {
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
  }

  @Get('stats')
  async getStats(@Req() req) {
    this.checkAdmin(req.user);
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    this.checkAdmin(req.user);
    return this.adminService.getUsers(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0
    );
  }

  @Put('users/:id/role')
  async updateRole(@Req() req, @Param('id') id: string, @Body() body: { role: 'USER' | 'ADMIN' }) {
    this.checkAdmin(req.user);
    return this.adminService.updateUserRole(id, body.role);
  }

  @Put('users/:id/status')
  async updateStatus(@Req() req, @Param('id') id: string, @Body() body: { status: 'ACTIVE' | 'SUSPENDED' }) {
    this.checkAdmin(req.user);
    return this.adminService.updateUserStatus(id, body.status);
  }

  @Put('users/:id/credits')
  async updateCredits(@Req() req, @Param('id') id: string, @Body() body: { credits: number }) {
    this.checkAdmin(req.user);
    return this.adminService.updateUserCredits(id, body.credits);
  }

  @Get('projects')
  async getProjects(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    this.checkAdmin(req.user);
    return this.adminService.getProjects(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0
    );
  }

  @Get('payments')
  async getPayments(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    this.checkAdmin(req.user);
    return this.adminService.getPayments(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0
    );
  }

  @Get('styles')
  async getStyles(@Req() req) {
    this.checkAdmin(req.user);
    return this.adminService.getStyles();
  }

  @Post('styles')
  async createStyle(@Req() req, @Body() body: any) {
    this.checkAdmin(req.user);
    return this.adminService.createStyle(body);
  }

  @Delete('styles/:id')
  async deleteStyle(@Req() req, @Param('id') id: string) {
    this.checkAdmin(req.user);
    return this.adminService.deleteStyle(id);
  }

  @Get('logs')
  async getLogs(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('level') level?: string
  ) {
    this.checkAdmin(req.user);
    return this.adminService.getSystemLogs(
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
      level
    );
  }
}

import { Controller, Get, Param, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Public redirect scanner route.
   */
  @Get('scan/:projectId')
  async handleScanRedirect(@Param('projectId') projectId: string, @Res() res: Response) {
    const targetUrl = await this.analyticsService.trackScan(projectId);
    res.redirect(HttpStatus.MOVED_PERMANENTLY, targetUrl);
  }

  /**
   * Aggregated system metrics.
   */
  @Get('analytics')
  @UseGuards(AuthGuard('jwt'))
  async getAnalyticsData() {
    return this.analyticsService.getSystemAnalytics();
  }
}

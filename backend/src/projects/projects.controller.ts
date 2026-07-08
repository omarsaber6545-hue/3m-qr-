import { Controller, Post, Get, Delete, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req, @Body() body: any) {
    const userId = req.user.id;
    return this.projectsService.createProject(userId, body);
  }

  @Get()
  async findAll(
    @Req() req,
    @Query('isFavorite') isFavorite?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const userId = req.user.id;
    return this.projectsService.getUserProjects(userId, { isFavorite, search, limit, offset });
  }

  @Get('collections')
  async getCollections(@Req() req) {
    const userId = req.user.id;
    return this.projectsService.getCollections(userId);
  }

  @Post('collections')
  @HttpCode(HttpStatus.CREATED)
  async createCollection(@Req() req, @Body() body: { name: string; description?: string }) {
    const userId = req.user.id;
    return this.projectsService.createCollection(userId, body);
  }

  @Delete('collections/:id')
  async deleteCollection(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    return this.projectsService.deleteCollection(userId, id);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    return this.projectsService.getProjectDetails(userId, id);
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    return this.projectsService.deleteProject(userId, id);
  }

  @Post(':id/favorite')
  @HttpCode(HttpStatus.OK)
  async toggleFav(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    return this.projectsService.toggleFavorite(userId, id);
  }

  @Post(':id/collection')
  @HttpCode(HttpStatus.OK)
  async assignColl(@Req() req, @Param('id') id: string, @Body() body: { collectionId: string | null }) {
    const userId = req.user.id;
    return this.projectsService.assignCollection(userId, id, body.collectionId);
  }
}

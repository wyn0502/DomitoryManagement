import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';

class CreateAnnouncementDto {
  title: string;
  content: string;
  adminId: string;
}

class UpdateAnnouncementDto {
  title?: string;
  content?: string;
  adminId?: string;
}

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  /**
   * Create a new announcement (Admin only)
   * POST /announcements
   */
  @Post()
  async createAnnouncement(@Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.createAnnouncement(
      dto.title,
      dto.content,
      dto.adminId,
    );
  }

  /**
   * Get all announcements
   * GET /announcements
   */
  @Get()
  async getAnnouncements() {
    return this.announcementsService.getAnnouncements();
  }

  /**
   * Get announcements with pagination
   * GET /announcements/paginated?page=1&limit=10
   */
  @Get('paginated')
  async getAnnouncementsWithPagination(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.announcementsService.getAnnouncementsWithPagination(
      parseInt(page),
      parseInt(limit),
    );
  }

  /**
   * Get announcement by ID
   * GET /announcements/:id
   */
  @Get(':id')
  async getAnnouncementById(@Param('id') id: string) {
    return this.announcementsService.getAnnouncementById(id);
  }

  /**
   * Get latest announcements
   * GET /announcements/latest?limit=5
   */
  @Get('latest')
  async getLatestAnnouncements(@Query('limit') limit: string = '5') {
    return this.announcementsService.getLatestAnnouncements(parseInt(limit));
  }

  /**
   * Search announcements
   * GET /announcements/search?q=keyword
   */
  @Get('search/query')
  async searchAnnouncements(@Query('q') query: string) {
    if (!query || query.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    return this.announcementsService.searchAnnouncements(query);
  }

  /**
   * Update announcement (Admin only)
   * PUT /announcements/:id
   */
  @Put(':id')
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.updateAnnouncement(
      id,
      dto.title,
      dto.content,
      dto.adminId,
    );
  }

  /**
   * Delete announcement (Admin only)
   * DELETE /announcements/:id
   */
  @Delete(':id')
  async deleteAnnouncement(
    @Param('id') id: string,
    @Query('adminId') adminId?: string,
  ) {
    return this.announcementsService.deleteAnnouncement(id, adminId);
  }
}

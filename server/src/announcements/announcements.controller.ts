import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/announcements')
@UseGuards(AuthGuard)
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  // Sinh viên & Admin đều có thể xem
  @Get()
  async findAll() {
    return this.announcementsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(parseInt(id, 10));
  }

  // Chỉ Admin mới được đăng / sửa / xóa
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() dto: { title: string; content: string }) {
    return this.announcementsService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: { title?: string; content?: string }) {
    return this.announcementsService.update(parseInt(id, 10), dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.announcementsService.remove(parseInt(id, 10));
  }
}
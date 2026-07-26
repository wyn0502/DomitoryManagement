import { Controller, Get, Post, Body, UseGuards, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/announcements')
@UseGuards(AuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) {}

  @Get()
  async getAnnouncements() {
    try {
      const announcements = await this.dataSource.query(
        'SELECT * FROM announcements ORDER BY created_at DESC'
      );
      return announcements;
    } catch (err) {
      throw new HttpException(
        'Lỗi truy vấn danh sách thông báo: ' + err.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @Roles('admin')
  async createAnnouncement(@Body() body: { title: string; content: string }) {
    if (!body.title || !body.content) {
      throw new HttpException(
        'Tiêu đề và nội dung thông báo không được để trống',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.dataSource.query(
        'INSERT INTO announcements (title, content) VALUES (?, ?)',
        [body.title, body.content],
      );
      return { success: true, message: 'Đăng thông báo thành công!' };
    } catch (err) {
      throw new HttpException(
        'Lỗi lưu thông báo vào cơ sở dữ liệu: ' + err.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

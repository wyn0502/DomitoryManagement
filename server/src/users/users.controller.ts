import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// CRUD người dùng + duyệt đăng ký phòng (chỉ Admin)
@Controller('api/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('pending-rooms')
  async findPendingRooms() {
    return this.usersService.findPendingRooms();
  }

  @Post()
  async createStudent(@Body() dto: any) {
    return this.usersService.createStudent(dto);
  }

  @Post(':id/approve-room')
  async approveRoom(@Param('id') id: number) {
    return this.usersService.approveRoom(id);
  }

  @Post(':id/reject-room')
  async rejectRoom(@Param('id') id: number) {
    return this.usersService.rejectRoom(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: any) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}

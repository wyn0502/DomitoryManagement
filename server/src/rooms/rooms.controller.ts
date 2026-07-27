import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  async findAll() {
    return this.roomsService.findAll();
  }

  // Lấy thành viên phòng của sinh viên đang đăng nhập (đặt TRƯỚC route ':id' để không bị nuốt)
  @UseGuards(AuthGuard)
  @Get('my-members')
  async myMembers(@Request() req: any) {
    return this.roomsService.findMyRoomMembers(req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.roomsService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() roomDto: any) {
    return this.roomsService.create(roomDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: number, @Body() roomDto: any) {
    return this.roomsService.update(id, roomDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.roomsService.remove(id);
  }
}

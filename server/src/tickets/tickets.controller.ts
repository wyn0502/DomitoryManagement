import {
  Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/tickets')
@UseGuards(AuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  // Student xem vé của mình (đặt TRƯỚC :id)
  @Get('mine')
  async myTickets(@Request() req: any) {
    return this.ticketsService.findMyTickets(req.user.sub);
  }

  // Sinh viên gửi ticket mới
  @Post()
  async create(@Request() req: any, @Body() dto: {
    title: string;
    description: string;
    urgency?: 'low' | 'medium' | 'high';
    image_url?: string;
  }) {
    return this.ticketsService.createTicket(req.user.sub, dto);
  }

  // ============ ADMIN ============

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.ticketsService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(parseInt(id, 10));
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: { status: 'pending' | 'processing' | 'completed'; admin_note?: string },
  ) {
    return this.ticketsService.updateStatus(parseInt(id, 10), dto.status, dto.admin_note);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ticketsService.remove(parseInt(id, 10));
  }
}
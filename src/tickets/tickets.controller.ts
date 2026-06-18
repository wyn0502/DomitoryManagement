import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TicketsService } from './tickets.service';
import { diskStorage } from 'multer';
import * as path from 'path';

class CreateTicketDto {
  studentId: string;
  roomNumber: string;
  description: string;
  priority?: string; // 'Low', 'Medium', 'High', 'Urgent'
}

class UpdateTicketStatusDto {
  status: string;
  adminId?: string;
}

// Multer configuration for file upload
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'tickets');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * Create a new ticket with optional image upload
   * POST /tickets
   * Content-Type: multipart/form-data
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage,
      fileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async createTicket(
    @Body() dto: CreateTicketDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    if (file) {
      imageUrl = `/uploads/tickets/${file.filename}`;
    }

    return this.ticketsService.createTicket(
      dto.studentId,
      dto.roomNumber,
      dto.description,
      dto.priority,
      imageUrl,
    );
  }

  /**
   * Get all tickets or filter by status
   * GET /tickets
   * GET /tickets?status=Pending
   */
  @Get()
  async getTickets(@Query('status') status?: string) {
    return this.ticketsService.getTickets(status);
  }

  /**
   * Get ticket by ID
   * GET /tickets/:id
   */
  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    return this.ticketsService.getTicketById(id);
  }

  /**
   * Get all tickets for a specific student
   * GET /tickets/student/:studentId
   */
  @Get('student/:studentId')
  async getTicketsByStudent(@Param('studentId') studentId: string) {
    return this.ticketsService.getTicketsByStudent(studentId);
  }

  /**
   * Update ticket status (Admin only)
   * PUT /tickets/:id/status
   */
  @Put(':id/status')
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateTicketStatus(id, dto.status, dto.adminId);
  }

  /**
   * Get ticket statistics
   * GET /tickets/stats/overview
   */
  @Get('stats/overview')
  async getTicketStats() {
    return this.ticketsService.getTicketStats();
  }

  /**
   * Search tickets by description or room number
   * GET /tickets/search?q=keyword
   */
  @Get('search/query')
  async searchTickets(@Query('q') query: string) {
    if (!query || query.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    return this.ticketsService.searchTickets(query);
  }
}

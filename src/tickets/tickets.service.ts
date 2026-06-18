import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TicketsService {
  private prisma: PrismaClient;
  private uploadDir = path.join(process.cwd(), 'uploads', 'tickets');

  constructor() {
    this.prisma = new PrismaClient();
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Create a new ticket
  async createTicket(
    studentId: string,
    roomNumber: string,
    description: string,
    priority: string = 'Medium',
    imageUrl?: string,
  ) {
    // Validate priority
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (!validPriorities.includes(priority)) {
      throw new BadRequestException('Invalid priority. Must be: Low, Medium, High, or Urgent');
    }

    // Validate student exists
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${studentId} not found`);
    }

    return await this.prisma.ticket.create({
      data: {
        studentId,
        roomNumber,
        description,
        priority,
        status: 'Pending',
        imageUrl,
      },
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  // Get all tickets or filter by status
  async getTickets(status?: string) {
    const where = status ? { status } : undefined;

    return await this.prisma.ticket.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get ticket by ID
  async getTicketById(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }

    return ticket;
  }

  // Get tickets for a specific student
  async getTicketsByStudent(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${studentId} not found`);
    }

    return await this.prisma.ticket.findMany({
      where: { studentId },
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Update ticket status (Admin only)
  async updateTicketStatus(id: string, status: string, adminId?: string) {
    // Validate status
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status. Must be: Pending, In Progress, Completed, or Cancelled');
    }

    // Check if admin exists and has admin role
    if (adminId) {
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId },
      });

      if (!admin || admin.role !== 'admin') {
        throw new ForbiddenException('Only admin can update ticket status');
      }
    }

    const ticket = await this.getTicketById(id);

    return await this.prisma.ticket.update({
      where: { id },
      data: {
        status,
      },
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  // Handle file upload for ticket
  async saveTicketImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      return null;
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, fileName);

    try {
      fs.writeFileSync(filePath, file.buffer);
      return `/uploads/tickets/${fileName}`;
    } catch (error) {
      throw new BadRequestException('Failed to upload image');
    }
  }

  // Get ticket statistics
  async getTicketStats() {
    const total = await this.prisma.ticket.count();
    const pending = await this.prisma.ticket.count({
      where: { status: 'Pending' },
    });
    const inProgress = await this.prisma.ticket.count({
      where: { status: 'In Progress' },
    });
    const completed = await this.prisma.ticket.count({
      where: { status: 'Completed' },
    });
    const cancelled = await this.prisma.ticket.count({
      where: { status: 'Cancelled' },
    });

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled,
    };
  }

  // Search tickets
  async searchTickets(query: string) {
    return await this.prisma.ticket.findMany({
      where: {
        OR: [
          { description: { contains: query } },
          { roomNumber: { contains: query } },
        ],
      },
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

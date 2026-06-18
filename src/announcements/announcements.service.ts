import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create a new announcement (Admin only)
   */
  async createAnnouncement(
    title: string,
    content: string,
    adminId: string,
  ) {
    // Validate admin exists and has admin role
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Only admin can create announcements');
    }

    // Validate inputs
    if (!title || title.trim().length === 0) {
      throw new BadRequestException('Title cannot be empty');
    }

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Content cannot be empty');
    }

    return await this.prisma.announcement.create({
      data: {
        title,
        content,
        adminId,
      },
    });
  }

  /**
   * Get all announcements
   */
  async getAnnouncements() {
    return await this.prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get announcements with pagination
   */
  async getAnnouncementsWithPagination(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.announcement.count(),
    ]);

    return {
      announcements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with id ${id} not found`);
    }

    return announcement;
  }

  /**
   * Update announcement (Admin only)
   */
  async updateAnnouncement(
    id: string,
    title?: string,
    content?: string,
    adminId?: string,
  ) {
    // Verify admin role
    if (adminId) {
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId },
      });

      if (!admin || admin.role !== 'admin') {
        throw new ForbiddenException('Only admin can update announcements');
      }
    }

    await this.getAnnouncementById(id); // Check if exists

    return await this.prisma.announcement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });
  }

  /**
   * Delete announcement (Admin only)
   */
  async deleteAnnouncement(id: string, adminId?: string) {
    // Verify admin role
    if (adminId) {
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId },
      });

      if (!admin || admin.role !== 'admin') {
        throw new ForbiddenException('Only admin can delete announcements');
      }
    }

    await this.getAnnouncementById(id); // Check if exists

    return await this.prisma.announcement.delete({
      where: { id },
    });
  }

  /**
   * Get latest announcements
   */
  async getLatestAnnouncements(limit: number = 5) {
    return await this.prisma.announcement.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Search announcements
   */
  async searchAnnouncements(query: string) {
    return await this.prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

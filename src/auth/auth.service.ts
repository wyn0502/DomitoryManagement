import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Register a new user
   */
  async register(username: string, password: string, email?: string, role: string = 'student') {
    // Validate inputs
    if (!username || username.length < 3) {
      throw new BadRequestException('Username must be at least 3 characters');
    }

    if (!password || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    if (!['admin', 'student'].includes(role)) {
      throw new BadRequestException('Role must be "admin" or "student"');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    return await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Login user
   */
  async login(username: string, password: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Return user info (without password)
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  /**
   * Get all users
   */
  async getAllUsers(role?: string) {
    const where = role ? { role } : undefined;

    return await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: string, newRole: string, adminId: string) {
    // Verify admin
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'admin') {
      throw new UnauthorizedException('Only admin can change user roles');
    }

    if (!['admin', 'student'].includes(newRole)) {
      throw new BadRequestException('Role must be "admin" or "student"');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Verify user is admin
   */
  async verifyAdmin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user?.role === 'admin';
  }
}

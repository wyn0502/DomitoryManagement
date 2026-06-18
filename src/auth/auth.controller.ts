import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

class RegisterDto {
  username: string;
  password: string;
  email?: string;
  role?: string; // 'admin' or 'student', default: 'student'
}

class LoginDto {
  username: string;
  password: string;
}

class UpdateRoleDto {
  newRole: string;
  adminId: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /auth/register
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.password, dto.email, dto.role);
  }

  /**
   * Login user
   * POST /auth/login
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  /**
   * Get user by ID
   * GET /auth/users/:id
   */
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  /**
   * Get user by username
   * GET /auth/users?username=john
   */
  @Get('users')
  async getUserByUsername(@Query('username') username: string) {
    if (!username) {
      throw new Error('Username query parameter is required');
    }
    return this.authService.getUserByUsername(username);
  }

  /**
   * Get all users or filter by role
   * GET /auth/all-users
   * GET /auth/all-users?role=admin
   */
  @Get('all-users')
  async getAllUsers(@Query('role') role?: string) {
    return this.authService.getAllUsers(role);
  }

  /**
   * Update user role (Admin only)
   * PUT /auth/users/:userId/role
   */
  @Post('users/:userId/role')
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.authService.updateUserRole(userId, dto.newRole, dto.adminId);
  }

  /**
   * Verify user is admin
   * GET /auth/verify-admin/:userId
   */
  @Get('verify-admin/:userId')
  async verifyAdmin(@Param('userId') userId: string) {
    const isAdmin = await this.authService.verifyAdmin(userId);
    return { userId, isAdmin };
  }
}

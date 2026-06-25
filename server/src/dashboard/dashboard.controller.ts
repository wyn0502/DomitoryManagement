import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('admin-stats')
  async getAdminStats() {
    return this.dashboardService.getAdminStats();
  }
}

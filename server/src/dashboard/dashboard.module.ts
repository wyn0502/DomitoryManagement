import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AnnouncementsController } from './announcements.controller';
import { DashboardService } from './dashboard.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DashboardController, AnnouncementsController],
  providers: [DashboardService],
})
export class DashboardModule {}

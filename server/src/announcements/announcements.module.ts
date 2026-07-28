import { Module } from '@nestjs/common';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { announcementsProviders } from './announcements.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AnnouncementsController],
  providers: [
    ...announcementsProviders,
    AnnouncementsService,
  ],
  exports: [
    AnnouncementsService,
    ...announcementsProviders,
  ],
})
export class AnnouncementsModule {}
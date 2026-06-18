import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { TicketsModule } from './tickets/tickets.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AssetsModule, TicketsModule, AnnouncementsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

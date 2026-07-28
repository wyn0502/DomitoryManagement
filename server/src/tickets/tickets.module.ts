import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { ticketsProviders } from './tickets.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TicketsController],
  providers: [
    ...ticketsProviders,
    TicketsService,
  ],
  exports: [
    TicketsService,
    ...ticketsProviders,
  ],
})
export class TicketsModule {}
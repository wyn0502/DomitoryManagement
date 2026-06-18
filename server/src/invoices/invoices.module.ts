import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { invoicesProviders } from './invoices.providers';
import { roomsProviders } from '../rooms/rooms.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InvoicesController],
  providers: [
    ...invoicesProviders,
    ...roomsProviders,
    InvoicesService,
  ],
  exports: [
    InvoicesService,
    ...invoicesProviders,
  ],
})
export class InvoicesModule {}

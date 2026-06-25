import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { roomsProviders } from './rooms.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RoomsController],
  providers: [
    ...roomsProviders,
    RoomsService,
  ],
  exports: [
    RoomsService,
    ...roomsProviders,
  ],
})
export class RoomsModule {}

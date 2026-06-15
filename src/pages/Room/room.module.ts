import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomStatusService } from './room-status.service';

@Module({
  controllers: [RoomController],
  providers: [RoomService, RoomStatusService],
})
export class RoomModule {}

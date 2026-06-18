import { Module } from '@nestjs/common';
import { RoomsModule } from '../infrastructure/rooms/rooms.module';
import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';

@Module({
  imports: [RoomsModule],
  controllers: [ResidentsController],
  providers: [ResidentsService],
})
export class ResidentsModule {}

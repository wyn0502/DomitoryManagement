import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BuildingsModule } from '../server/src/infrastructure/buildings/buildings.module';
import { RoomsModule } from '../server/src/infrastructure/rooms/rooms.module';
import { ResidentsModule } from '../server/src/residents/residents.module';

@Module({
  imports: [BuildingsModule, RoomsModule, ResidentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BuildingModule } from './pages/Buildings/building.module';
import { RoomModule } from './pages/Room/room.module';

@Module({
  imports: [BuildingModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

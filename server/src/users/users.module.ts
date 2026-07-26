import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { authProviders } from '../auth/auth.providers';
import { roomsProviders } from '../rooms/rooms.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [...authProviders, ...roomsProviders, UsersService],
})
export class UsersModule {}

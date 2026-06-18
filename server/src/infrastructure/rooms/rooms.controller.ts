import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('infrastructure/buildings/:buildingId/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(
    @Param('buildingId') buildingId: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomsService.create(buildingId, dto);
  }

  @Get()
  findByBuilding(@Param('buildingId') buildingId: string) {
    return this.roomsService.findByBuilding(buildingId);
  }

  @Get(':id')
  findOne(
    @Param('buildingId') buildingId: string,
    @Param('id') id: string,
  ) {
    return this.roomsService.findOne(buildingId, id);
  }

  @Post(':id/assign-resident')
  assignResident(
    @Param('buildingId') buildingId: string,
    @Param('id') id: string,
  ) {
    return this.roomsService.assignResident(buildingId, id);
  }

  @Patch(':id')
  update(
    @Param('buildingId') buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(buildingId, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('buildingId') buildingId: string,
    @Param('id') id: string,
  ) {
    return this.roomsService.remove(buildingId, id);
  }
}

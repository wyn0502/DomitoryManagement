import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto } from './room.dto';

interface Room {
  id: number;
  roomNumber: string;
  buildingId: number;
  roomType: string;
  originalPrice: number;
  maxCapacity: number;
  currentOccupancy?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  findAll(@Query('buildingId') buildingId?: string): any[] {
    if (buildingId) {
      return this.roomService.findByBuildingId(+buildingId);
    }
    return this.roomService.findAll();
  }

  @Get('building/:buildingId')
  findByBuilding(@Param('buildingId') buildingId: string): any[] {
    return this.roomService.findByBuildingId(+buildingId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): any {
    return this.roomService.findOne(+id);
  }

  @Post()
  create(@Body() createRoomDto: CreateRoomDto): any {
    return this.roomService.create(createRoomDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto): any {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): any {
    return this.roomService.remove(+id);
  }
}

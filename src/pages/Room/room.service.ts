import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateRoomDto, UpdateRoomDto } from './room.dto';
import { Room } from './room.entity';
import { RoomStatusService } from './room-status.service';

@Injectable()
export class RoomService {
  private rooms: Room[] = [];
  private idCounter = 1;

  constructor(private readonly roomStatusService: RoomStatusService) {}

  findAll() {
    return this.rooms;
  }

  findByBuildingId(buildingId: number) {
    const rooms = this.rooms.filter(room => room.buildingId === buildingId);
    if (rooms.length === 0) {
      throw new NotFoundException(`No rooms found for building ID: ${buildingId}`);
    }
    return rooms;
  }

  findOne(id: number) {
    const room = this.rooms.find(room => room.id === id);
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  create(createRoomDto: CreateRoomDto) {
    // Validate that current occupancy doesn't exceed max capacity
    if (createRoomDto.currentOccupancy && createRoomDto.currentOccupancy > createRoomDto.maxCapacity) {
      throw new BadRequestException('Current occupancy cannot exceed max capacity');
    }

    const room: Room = {
      id: this.idCounter++,
      ...createRoomDto,
      currentOccupancy: createRoomDto.currentOccupancy || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rooms.push(room);
    return room;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    const room = this.findOne(id);
    
    // Validate that current occupancy doesn't exceed max capacity
    const newMaxCapacity = updateRoomDto.maxCapacity || room.maxCapacity;
    const newCurrentOccupancy = updateRoomDto.currentOccupancy !== undefined ? updateRoomDto.currentOccupancy : room.currentOccupancy || 0;
    
    if (newCurrentOccupancy > newMaxCapacity) {
      throw new BadRequestException('Current occupancy cannot exceed max capacity');
    }

    const updatedRoom = {
      ...room,
      ...updateRoomDto,
      updatedAt: new Date(),
    };
    
    const index = this.rooms.findIndex(r => r.id === id);
    this.rooms[index] = updatedRoom;
    return updatedRoom;
  }

  remove(id: number) {
    const index = this.rooms.findIndex(room => room.id === id);
    if (index === -1) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return this.rooms.splice(index, 1)[0];
  }
}

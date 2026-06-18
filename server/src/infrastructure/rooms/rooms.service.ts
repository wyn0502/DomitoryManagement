import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  private readonly roomsByBuilding = new Map<string, Room[]>();

  create(buildingId: string, dto: CreateRoomDto): Room {
    const room: Room = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      buildingId,
      roomNumber: dto.roomNumber,
      capacity: dto.capacity,
      roomType: dto.roomType,
      price: dto.price,
      occupied: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const rooms = this.roomsByBuilding.get(buildingId) ?? [];
    rooms.push(room);
    this.roomsByBuilding.set(buildingId, rooms);
    return room;
  }

  findByBuilding(buildingId: string): Room[] {
    return [...(this.roomsByBuilding.get(buildingId) ?? [])];
  }

  findOne(buildingId: string, id: string): Room {
    const room = (this.roomsByBuilding.get(buildingId) ?? []).find(
      (item) => item.id === id,
    );

    if (!room) {
      throw new NotFoundException(
        `Room with id ${id} not found in building ${buildingId}`,
      );
    }

    return room;
  }

  update(buildingId: string, id: string, dto: UpdateRoomDto): Room {
    const rooms = this.roomsByBuilding.get(buildingId) ?? [];
    const index = rooms.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(
        `Room with id ${id} not found in building ${buildingId}`,
      );
    }

    rooms[index] = {
      ...rooms[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.roomsByBuilding.set(buildingId, rooms);
    return rooms[index];
  }

  assignResident(buildingId: string, id: string): Room {
    const room = this.findOne(buildingId, id);

    if (room.occupied >= room.capacity) {
      throw new BadRequestException('Room is already full');
    }

    room.occupied += 1;
    room.updatedAt = new Date().toISOString();

    return room;
  }

  remove(buildingId: string, id: string): boolean {
    const rooms = this.roomsByBuilding.get(buildingId) ?? [];
    const index = rooms.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    rooms.splice(index, 1);
    this.roomsByBuilding.set(buildingId, rooms);
    return true;
  }
}

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @Inject('ROOM_REPOSITORY')
    private roomRepository: Repository<Room>,
  ) {}

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({ relations: ['students'] });
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id }, relations: ['students'] });
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}`);
    }
    return room;
  }

  //bo sung current-occupancy
  async increaseCurrentOccupancy(roomId: number): Promise<Room> {
    const room = await this.findOne(roomId);
    if (room.current_occupancy < room.capacity) {
      room.current_occupancy += 1;
      return this.roomRepository.save(room);
    } else {
      throw new Error(`Phòng ${room.room_name} đã đầy`);
    }
  }
  
  async decreaseCurrentOccupancy(roomId: number): Promise<Room> {
    const room = await this.findOne(roomId);
    if (room.current_occupancy > 0) {
      room.current_occupancy -= 1;
      return this.roomRepository.save(room);
    } else {
      throw new Error(`Phòng ${room.room_name} đã trống`);
    }
  }


  async create(roomDto: Partial<Room>): Promise<Room> {
    const room = this.roomRepository.create(roomDto);
    return this.roomRepository.save(room);
  }

  async update(id: number, roomDto: Partial<Room>): Promise<Room> {
    const room = await this.roomRepository.preload({
      id,
      ...roomDto,
    });
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}`);
    }
    return this.roomRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);
    await this.roomRepository.remove(room);
  }
}

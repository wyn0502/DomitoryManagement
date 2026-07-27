import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';

import { User } from '../auth/entities/user.entity';

@Injectable()
export class RoomsService {
  constructor(
    @Inject('ROOM_REPOSITORY')
    private roomRepository: Repository<Room>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  // Loại bỏ trường password khỏi danh sách sinh viên trước khi trả về client
  private stripStudentPasswords(room: Room): Room {
    if (room?.students) {
      room.students = room.students.map((s) => {
        const { password: _pw, ...rest } = s;
        return rest as typeof s;
      });
    }
    return room;
  }

  async findAll(): Promise<Room[]> {
    const rooms = await this.roomRepository.find({ relations: ['students'] });
    return rooms.map((r) => this.stripStudentPasswords(r));
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id }, relations: ['students'] });
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}`);
    }
    return this.stripStudentPasswords(room);
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

  // UPDATE: cập nhật thông tin phòng
  async update(id: number, roomDto: Partial<Room>): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}`);
    }
    ['room_name', 'capacity', 'type', 'fixed_rent'].forEach((f) => {
      if ((roomDto as any)[f] !== undefined) (room as any)[f] = (roomDto as any)[f];
    });
    if (room.capacity < room.current_occupancy) {
      throw new ConflictException('Sức chứa mới không được nhỏ hơn số người đang ở');
    }
    return this.roomRepository.save(room);
  }

  // DELETE: xoá phòng (chặn nếu còn sinh viên đang ở)
  async remove(id: number): Promise<{ message: string }> {
    const room = await this.roomRepository.findOne({ where: { id }, relations: ['students'] });
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}`);
    }
    if (room.students && room.students.length > 0) {
      throw new ConflictException('Không thể xóa phòng vì vẫn còn sinh viên đang ở');
    }
    await this.roomRepository.remove(room);
    return { message: `Đã xóa phòng ID ${id}` };
  }

  // Lấy danh sách bạn cùng phòng của sinh viên đang đăng nhập (chính xác 100%, loại bỏ báo ảo)
  async findMyRoomMembers(userId: number): Promise<Array<{ id: number; full_name: string; mssv: string; role: string }>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.room_status !== 'approved' || !user.room_id) {
      return [];
    }

    const room = await this.roomRepository.findOne({ where: { id: user.room_id }, relations: ['students'] });
    if (!room || !room.students) {
      return [];
    }

    // Chỉ lấy các sinh viên CÙNG PHÒNG đã được DUYỆT PHÒNG (`room_status = 'approved'`)
    return room.students
      .filter((s) => s.room_status === 'approved')
      .map((s) => ({
        id: s.id,
        full_name: s.full_name || s.username,
        mssv: s.mssv || '—',
        role: s.role,
      }));
  }
}

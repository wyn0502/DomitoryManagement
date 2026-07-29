import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('ROOM_REPOSITORY')
    private roomRepository: Repository<Room>,
  ) {}

  private strip(u: User): any {
    const { password: _pw, ...rest } = u;
    return rest;
  }

  // READ: danh sách toàn bộ người dùng
  async findAll(): Promise<any[]> {
    const users = await this.userRepository.find({ relations: ['room'], order: { id: 'ASC' } });
    return users.map((u) => this.strip(u));
  }

  // READ: các yêu cầu đăng ký phòng đang chờ duyệt
  async findPendingRooms(): Promise<any[]> {
    const users = await this.userRepository.find({
      where: { room_status: 'pending' },
      relations: ['room'],
      order: { updated_at: 'DESC' },
    });
    return Promise.all(
      users.map(async (u) => {
        const pendingRoom = u.pending_room_id
          ? await this.roomRepository.findOne({ where: { id: u.pending_room_id } })
          : null;
        return { ...this.strip(u), pending_room_name: pendingRoom ? pendingRoom.room_name : null };
      }),
    );
  }

  private async syncRoomOccupancy(roomId: number | null): Promise<void> {
    if (!roomId) return;
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) return;
    const approvedCount = await this.userRepository.count({
      where: { room_id: roomId, room_status: 'approved' },
    });
    room.current_occupancy = approvedCount;
    await this.roomRepository.save(room);
  }

  // CREATE: Thêm sinh viên mới trực tiếp từ Admin
  async createStudent(dto: any): Promise<any> {
    const { username, password, email, full_name, mssv, phone, class_name, hometown, cccd, gender, room_id, room_status } = dto;
    if (!username || !email) {
      throw new BadRequestException('Vui lòng nhập tên đăng nhập và email');
    }
    const conditions: any[] = [{ username }, { email }];
    if (mssv && mssv.trim()) conditions.push({ mssv: mssv.trim() });
    if (cccd && cccd.trim()) conditions.push({ cccd: cccd.trim() });

    const existingUser = await this.userRepository.findOne({
      where: conditions,
    });
    if (existingUser) {
      if (existingUser.username === username) throw new ConflictException('Tên đăng nhập đã tồn tại');
      if (existingUser.email === email) throw new ConflictException('Email đã tồn tại');
      if (mssv && existingUser.mssv === mssv.trim()) throw new ConflictException('Mã số sinh viên (MSSV) đã được đăng ký');
      if (cccd && existingUser.cccd === cccd.trim()) throw new ConflictException('Số CCCD đã được đăng ký');
      throw new ConflictException('Tên đăng nhập, email, MSSV hoặc CCCD đã tồn tại');
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      role: 'student',
      full_name,
      mssv,
      phone,
      class_name,
      hometown,
      cccd,
      gender: gender || 'Nam',
      room_id: room_id ? Number(room_id) : null,
      room_status: room_status || (room_id ? 'approved' : 'none'),
    });

    const saved = await this.userRepository.save(user);
    if (saved.room_id) {
      await this.syncRoomOccupancy(saved.room_id);
    }
    return this.strip(saved);
  }

  // UPDATE (duyệt): gán phòng đang chờ cho sinh viên
  async approveRoom(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy sinh viên');
    if (user.room_status !== 'pending' || !user.pending_room_id) {
      throw new BadRequestException('Sinh viên này không có yêu cầu đăng ký phòng đang chờ');
    }
    const room = await this.roomRepository.findOne({ where: { id: user.pending_room_id } });
    if (!room) throw new BadRequestException('Phòng đăng ký không còn tồn tại');

    const approvedCount = await this.userRepository.count({
      where: { room_id: room.id, room_status: 'approved' },
    });
    if (approvedCount >= room.capacity) {
      throw new ConflictException('Phòng đã đầy chỗ, không thể duyệt');
    }

    const oldRoomId = user.room_id;
    user.room_id = user.pending_room_id;
    user.room_status = 'approved';
    user.pending_room_id = null;
    await this.userRepository.save(user);

    await this.syncRoomOccupancy(oldRoomId);
    await this.syncRoomOccupancy(user.room_id);

    return { message: `Đã duyệt phòng ${room.room_name} cho sinh viên ${user.full_name || user.username}` };
  }

  // UPDATE (từ chối): huỷ yêu cầu đăng ký phòng
  async rejectRoom(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy sinh viên');
    if (user.room_status !== 'pending') {
      throw new BadRequestException('Sinh viên này không có yêu cầu đăng ký phòng đang chờ');
    }
    user.room_status = 'rejected';
    user.pending_room_id = null;
    await this.userRepository.save(user);
    return { message: `Đã từ chối yêu cầu đăng ký phòng của ${user.full_name || user.username}` };
  }

  // UPDATE: cập nhật thông tin hồ sơ người dùng
  async update(userId: number, dto: any): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const oldRoomId = user.room_id;

    // Kiểm tra trùng lặp thông tin nếu có sửa mssv, email, cccd
    const checkConds: any[] = [];
    if (dto.email && dto.email.trim() !== user.email) checkConds.push({ email: dto.email.trim() });
    if (dto.mssv && dto.mssv.trim() !== user.mssv) checkConds.push({ mssv: dto.mssv.trim() });
    if (dto.cccd && dto.cccd.trim() !== user.cccd) checkConds.push({ cccd: dto.cccd.trim() });

    if (checkConds.length > 0) {
      const dup = await this.userRepository.findOne({ where: checkConds });
      if (dup && dup.id !== userId) {
        if (dto.email && dup.email === dto.email.trim()) throw new ConflictException('Email đã được sử dụng bởi tài khoản khác');
        if (dto.mssv && dup.mssv === dto.mssv.trim()) throw new ConflictException('Mã số sinh viên (MSSV) đã thuộc về sinh viên khác');
        if (dto.cccd && dup.cccd === dto.cccd.trim()) throw new ConflictException('Số CCCD đã thuộc về sinh viên khác');
      }
    }

    ['full_name', 'phone', 'class_name', 'hometown', 'mssv', 'email', 'cccd', 'gender'].forEach((f) => {
      if (dto[f] !== undefined) (user as any)[f] = dto[f];
    });

    if (dto.room_id !== undefined) {
      user.room_id = dto.room_id ? Number(dto.room_id) : null;
    }

    if (dto.room_status !== undefined) {
      user.room_status = dto.room_status;
    }

    await this.userRepository.save(user);

    if (oldRoomId) await this.syncRoomOccupancy(oldRoomId);
    if (user.room_id) await this.syncRoomOccupancy(user.room_id);

    return this.strip(user);
  }

  // DELETE: xoá người dùng (giảm số người ở nếu đang ở phòng)
  async remove(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    const oldRoomId = user.room_id;
    await this.userRepository.remove(user);
    if (oldRoomId) {
      await this.syncRoomOccupancy(oldRoomId);
    }
    return { message: `Đã xóa người dùng ${user.full_name || user.username}` };
  }
}

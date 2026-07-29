import { ConflictException, Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('ROOM_REPOSITORY')
    private roomRepository: Repository<Room>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: any): Promise<any> {
    const { username, password, role, room_id, full_name, mssv, hometown, phone, class_name } = registerDto;
    const email = (registerDto.email || '').trim();
    if (!email) {
      throw new BadRequestException('Email không được để trống, vui lòng nhập email của bạn');
    }

    // Kiểm tra trùng lặp
    const conditions: any[] = [{ username }, { email }];
    if (mssv && mssv.trim()) conditions.push({ mssv: mssv.trim() });
    if (registerDto.cccd && registerDto.cccd.trim()) conditions.push({ cccd: registerDto.cccd.trim() });

    const existingUser = await this.userRepository.findOne({
      where: conditions,
    });
    if (existingUser) {
      if (existingUser.username === username) throw new ConflictException('Tên đăng nhập đã tồn tại');
      if (existingUser.email === email) throw new ConflictException('Email đã tồn tại');
      if (mssv && existingUser.mssv === mssv.trim()) throw new ConflictException('Mã số sinh viên (MSSV) đã được sử dụng');
      if (registerDto.cccd && existingUser.cccd === registerDto.cccd.trim()) throw new ConflictException('Số CCCD đã được sử dụng');
      throw new ConflictException('Thông tin tài khoản (Tên đăng nhập, Email, MSSV hoặc CCCD) đã tồn tại');
    }

    // Kiểm tra phòng ở đăng ký (chỉ áp dụng cho sinh viên có chọn phòng)
    let targetRoom: Room | null = null;
    if (role !== 'admin' && room_id) {
      targetRoom = await this.roomRepository.findOne({ where: { id: room_id } });
      if (!targetRoom) {
        throw new BadRequestException('Phòng ở đăng ký không tồn tại');
      }
      if (targetRoom.current_occupancy >= targetRoom.capacity) {
        throw new ConflictException('Phòng đã đầy chỗ, vui lòng chọn phòng khác');
      }
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      role: role || 'student',
      room_id: role === 'admin' ? null : room_id,
      full_name,
      mssv,
      hometown,
      phone,
      class_name,
    });

    const savedUser = await this.userRepository.save(user);

    // Tăng số lượng người ở hiện tại của phòng sau khi đăng ký thành công
    if (targetRoom) {
      targetRoom.current_occupancy += 1;
      await this.roomRepository.save(targetRoom);
    }

    const { password: _, ...result } = savedUser;
    return result;
  }

  async login(loginDto: any): Promise<any> {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['room'],
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      room_id: user.room_id,
      room_name: user.room ? user.room.room_name : null,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        room_id: user.room_id,
        room_name: user.room ? user.room.room_name : null,
        room_status: user.room_status,
        full_name: user.full_name,
      },
    };
  }

  // Sinh viên GỬI YÊU CẦU đăng ký phòng (chờ Admin duyệt, chưa được xếp phòng ngay)
  async registerRoom(userId: number, roomId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }
    if (user.role === 'admin') {
      throw new BadRequestException('Tài khoản quản trị viên không cần đăng ký phòng');
    }
    if (user.room_id) {
      throw new ConflictException('Bạn đã được xếp phòng rồi, không thể đăng ký thêm phòng khác');
    }
    if (user.room_status === 'pending') {
      throw new ConflictException('Bạn đã gửi yêu cầu đăng ký phòng và đang chờ Admin duyệt');
    }

    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) {
      throw new BadRequestException('Phòng đăng ký không tồn tại');
    }
    if (room.current_occupancy >= room.capacity) {
      throw new ConflictException('Phòng đã đầy chỗ, vui lòng chọn phòng khác');
    }

    // Chỉ ghi nhận yêu cầu, KHÔNG gán phòng và KHÔNG tăng số người ở (chờ Admin duyệt)
    user.pending_room_id = roomId;
    user.room_status = 'pending';
    await this.userRepository.save(user);

    return {
      message: `Đã gửi yêu cầu đăng ký phòng ${room.room_name}. Vui lòng chờ Ban quản lý ký túc xá (Admin) duyệt.`,
      room_status: 'pending',
      pending_room_name: room.room_name,
    };
  }

  async getProfile(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['room'],
    });
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    }
    const { password: _, ...result } = user;
    return result;
  }
}

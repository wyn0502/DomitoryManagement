import { ConflictException, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: any): Promise<any> {
    const { username, password, role, room_id, full_name, mssv, hometown, phone, class_name } = registerDto;
    const email = registerDto.email || `${username}@ktx.com`;
    
    // Kiểm tra trùng lặp
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('Tên đăng nhập hoặc email đã tồn tại');
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
        full_name: user.full_name,
      },
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

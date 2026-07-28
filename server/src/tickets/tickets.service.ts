import { Injectable, NotFoundException, ConflictException, Inject, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { Room } from '../rooms/entities/room.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @Inject('TICKET_REPOSITORY')
    private ticketRepository: Repository<Ticket>,
    @Inject('ROOM_REPOSITORY')
    private roomRepository: Repository<Room>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  // ============ ADMIN ============

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find({
      relations: ['room', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['room', 'user'],
    });
    if (!ticket) throw new NotFoundException(`Không tìm thấy ticket #${id}`);
    return ticket;
  }

  // Cập nhật trạng thái ticket (Chờ xử lý -> Đang sửa -> Đã xong)
  async updateStatus(
    id: number,
    status: 'pending' | 'processing' | 'completed',
    adminNote?: string,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);
    ticket.status = status;
    if (adminNote !== undefined) {
      ticket.admin_note = adminNote?.trim() || null;
    }
    return this.ticketRepository.save(ticket);
  }

  async remove(id: number): Promise<{ message: string }> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
    return { message: `Đã xóa ticket #${id}` };
  }

  // ============ STUDENT ============

  // Sinh viên đang đăng nhập xem các ticket do mình gửi
  async findMyTickets(userId: number): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { user_id: userId },
      relations: ['room'],
      order: { created_at: 'DESC' },
    });
  }

  // Sinh viên gửi ticket mới (phải thuộc phòng đã được duyệt)
  async createTicket(
    userId: number,
    dto: { title: string; description: string; urgency?: 'low' | 'medium' | 'high'; image_url?: string },
  ): Promise<Ticket> {
    if (!dto.title?.trim() || !dto.description?.trim()) {
      throw new ConflictException('Tiêu đề và mô tả sự cố không được để trống');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản sinh viên');
    if (user.role !== 'student') {
      throw new ForbiddenException('Chỉ sinh viên mới được gửi báo cáo sự cố');
    }
    if (!user.room_id || user.room_status !== 'approved') {
      throw new ConflictException('Bạn chưa được xếp phòng — không thể gửi báo cáo sự cố');
    }
    const room = await this.roomRepository.findOne({ where: { id: user.room_id } });
    if (!room) throw new NotFoundException('Không tìm thấy phòng của bạn');

    const ticket = this.ticketRepository.create({
      room_id: room.id,
      user_id: user.id,
      title: dto.title.trim(),
      description: dto.description.trim(),
      urgency: dto.urgency || 'medium',
      image_url: dto.image_url?.trim() || null,
      status: 'pending',
    });
    return this.ticketRepository.save(ticket);
  }
}
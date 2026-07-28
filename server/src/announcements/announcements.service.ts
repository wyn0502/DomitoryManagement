import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @Inject('ANNOUNCEMENT_REPOSITORY')
    private announcementRepository: Repository<Announcement>,
  ) {}

  async findAll(): Promise<Announcement[]> {
    return this.announcementRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Announcement> {
    const ann = await this.announcementRepository.findOne({ where: { id } });
    if (!ann) throw new NotFoundException(`Không tìm thấy thông báo #${id}`);
    return ann;
  }

  async create(dto: { title: string; content: string }): Promise<Announcement> {
    if (!dto.title?.trim() || !dto.content?.trim()) {
      throw new ConflictException('Tiêu đề và nội dung thông báo không được để trống');
    }
    const ann = this.announcementRepository.create({
      title: dto.title.trim(),
      content: dto.content.trim(),
    });
    return this.announcementRepository.save(ann);
  }

  async update(id: number, dto: { title?: string; content?: string }): Promise<Announcement> {
    const ann = await this.findOne(id);
    if (dto.title !== undefined) ann.title = dto.title.trim();
    if (dto.content !== undefined) ann.content = dto.content.trim();
    return this.announcementRepository.save(ann);
  }

  async remove(id: number): Promise<{ message: string }> {
    const ann = await this.findOne(id);
    await this.announcementRepository.remove(ann);
    return { message: `Đã xóa thông báo #${id}` };
  }
}
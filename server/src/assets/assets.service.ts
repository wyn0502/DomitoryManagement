import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { RoomAsset } from './entities/room-asset.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class AssetsService {
  constructor(
    @Inject('ASSET_REPOSITORY')
    private assetRepository: Repository<Asset>,
    @Inject('ROOM_ASSET_REPOSITORY')
    private roomAssetRepository: Repository<RoomAsset>,
    @Inject('ROOM_REPOSITORY')
    private roomRepository: Repository<Room>,
  ) {}

  // ===== ASSET CATALOG =====

  async findAllAssets(): Promise<Asset[]> {
    return this.assetRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOneAsset(id: number): Promise<Asset> {
    const asset = await this.assetRepository.findOne({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Không tìm thấy tài sản với ID ${id}`);
    }
    return asset;
  }

  async createAsset(dto: Partial<Asset>): Promise<Asset> {
    if (!dto.name || !dto.name.trim()) {
      throw new ConflictException('Tên tài sản không được để trống');
    }
    const existing = await this.assetRepository.findOne({ where: { name: dto.name.trim() } });
    if (existing) {
      throw new ConflictException(`Tài sản "${dto.name}" đã tồn tại trong danh mục`);
    }
    const asset = this.assetRepository.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
    });
    return this.assetRepository.save(asset);
  }

  async updateAsset(id: number, dto: Partial<Asset>): Promise<Asset> {
    const asset = await this.findOneAsset(id);
    if (dto.name && dto.name.trim() && dto.name.trim() !== asset.name) {
      const dup = await this.assetRepository.findOne({ where: { name: dto.name.trim() } });
      if (dup && dup.id !== id) {
        throw new ConflictException(`Tên tài sản "${dto.name}" đã được sử dụng`);
      }
      asset.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      asset.description = dto.description?.trim() || null;
    }
    return this.assetRepository.save(asset);
  }

  async removeAsset(id: number): Promise<{ message: string }> {
    const asset = await this.findOneAsset(id);
    const usedIn = await this.roomAssetRepository.count({ where: { asset_id: id } });
    if (usedIn > 0) {
      throw new ConflictException(
        `Không thể xóa tài sản "${asset.name}" vì đang được phân bổ cho ${usedIn} phòng. Hãy xóa phân bổ trước.`,
      );
    }
    await this.assetRepository.remove(asset);
    return { message: `Đã xóa tài sản "${asset.name}" khỏi danh mục` };
  }

  // ===== ROOM ASSET ALLOCATION =====

  // Lấy danh sách phân bổ tài sản cho 1 phòng (sinh viên xem thiết bị phòng mình)
  async findRoomAssetsByRoom(roomId: number): Promise<RoomAsset[]> {
    return this.roomAssetRepository.find({
      where: { room_id: roomId },
      relations: ['asset'],
      order: { asset_id: 'ASC' },
    });
  }

  // Lấy tất cả phân bổ tài sản của mọi phòng (admin xem tổng quan)
  async findAllRoomAllocations(): Promise<RoomAsset[]> {
    return this.roomAssetRepository.find({
      relations: ['asset', 'room'],
      order: { room_id: 'ASC', asset_id: 'ASC' },
    });
  }

  async allocateAssetToRoom(dto: {
    room_id: number;
    asset_id: number;
    quantity: number;
    status?: 'new' | 'used' | 'broken';
  }): Promise<RoomAsset> {
    if (!dto.room_id || !dto.asset_id) {
      throw new ConflictException('Thiếu phòng hoặc tài sản');
    }
    const room = await this.roomRepository.findOne({ where: { id: dto.room_id } });
    if (!room) throw new NotFoundException(`Không tìm thấy phòng ID ${dto.room_id}`);
    const asset = await this.assetRepository.findOne({ where: { id: dto.asset_id } });
    if (!asset) throw new NotFoundException(`Không tìm thấy tài sản ID ${dto.asset_id}`);

    const qty = Math.max(1, parseInt(String(dto.quantity), 10) || 1);

    // Một phòng chỉ có một dòng phân bổ cho mỗi tài sản (cộng dồn số lượng nếu đã có)
    const existing = await this.roomAssetRepository.findOne({
      where: { room_id: dto.room_id, asset_id: dto.asset_id },
    });

    if (existing) {
      existing.quantity = qty;
      existing.status = dto.status || existing.status;
      return this.roomAssetRepository.save(existing);
    }

    const row = this.roomAssetRepository.create({
      room_id: dto.room_id,
      asset_id: dto.asset_id,
      quantity: qty,
      status: dto.status || 'new',
    });
    return this.roomAssetRepository.save(row);
  }

  async updateAllocation(
    id: number,
    dto: { quantity?: number; status?: 'new' | 'used' | 'broken' },
  ): Promise<RoomAsset> {
    const row = await this.roomAssetRepository.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Không tìm thấy phân bổ ID ${id}`);
    if (dto.quantity !== undefined) {
      row.quantity = Math.max(1, parseInt(String(dto.quantity), 10) || 1);
    }
    if (dto.status && ['new', 'used', 'broken'].includes(dto.status)) {
      row.status = dto.status;
    }
    return this.roomAssetRepository.save(row);
  }

  async removeAllocation(id: number): Promise<{ message: string }> {
    const row = await this.roomAssetRepository.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Không tìm thấy phân bổ ID ${id}`);
    await this.roomAssetRepository.remove(row);
    return { message: `Đã xóa phân bổ tài sản khỏi phòng` };
  }
}
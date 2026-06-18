import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AssetsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Asset Type CRUD
  async createAssetType(name: string, description?: string) {
    try {
      return await this.prisma.assetType.create({
        data: {
          name,
          description,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Asset type name already exists');
      }
      throw error;
    }
  }

  async getAssetTypes() {
    return await this.prisma.assetType.findMany({
      include: {
        roomAssets: true,
      },
    });
  }

  async getAssetTypeById(id: string) {
    const assetType = await this.prisma.assetType.findUnique({
      where: { id },
      include: {
        roomAssets: true,
      },
    });

    if (!assetType) {
      throw new NotFoundException(`Asset type with id ${id} not found`);
    }

    return assetType;
  }

  async updateAssetType(id: string, name?: string, description?: string) {
    await this.getAssetTypeById(id); // Check if exists

    try {
      return await this.prisma.assetType.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
        include: {
          roomAssets: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Asset type name already exists');
      }
      throw error;
    }
  }

  async deleteAssetType(id: string) {
    await this.getAssetTypeById(id); // Check if exists

    return await this.prisma.assetType.delete({
      where: { id },
    });
  }

  // Room Assets - Allocation
  async assignAssetToRoom(
    roomNumber: string,
    assetTypeId: string,
    quantity: number,
    condition: string = 'New',
  ) {
    // Validate asset type exists
    await this.getAssetTypeById(assetTypeId);

    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Validate condition
    const validConditions = ['New', 'Old', 'Broken'];
    if (!validConditions.includes(condition)) {
      throw new BadRequestException('Invalid condition. Must be: New, Old, or Broken');
    }

    try {
      return await this.prisma.roomAsset.upsert({
        where: {
          roomNumber_assetTypeId: {
            roomNumber,
            assetTypeId,
          },
        },
        update: {
          quantity,
          condition,
        },
        create: {
          roomNumber,
          assetTypeId,
          quantity,
          condition,
        },
        include: {
          assetType: true,
        },
      });
    } catch (error: any) {
      throw new BadRequestException('Failed to assign asset to room');
    }
  }

  async getRoomAssets(roomNumber?: string) {
    const where = roomNumber ? { roomNumber } : undefined;

    return await this.prisma.roomAsset.findMany({
      where,
      include: {
        assetType: true,
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });
  }

  async getRoomAssetDetail(id: string) {
    const roomAsset = await this.prisma.roomAsset.findUnique({
      where: { id },
      include: {
        assetType: true,
      },
    });

    if (!roomAsset) {
      throw new NotFoundException(`Room asset with id ${id} not found`);
    }

    return roomAsset;
  }

  async updateRoomAsset(
    id: string,
    quantity?: number,
    condition?: string,
  ) {
    await this.getRoomAssetDetail(id); // Check if exists

    if (quantity !== undefined && quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    if (condition !== undefined) {
      const validConditions = ['New', 'Old', 'Broken'];
      if (!validConditions.includes(condition)) {
        throw new BadRequestException('Invalid condition. Must be: New, Old, or Broken');
      }
    }

    return await this.prisma.roomAsset.update({
      where: { id },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(condition !== undefined && { condition }),
      },
      include: {
        assetType: true,
      },
    });
  }

  async deleteRoomAsset(id: string) {
    await this.getRoomAssetDetail(id); // Check if exists

    return await this.prisma.roomAsset.delete({
      where: { id },
    });
  }

  async getRoomAssetsByRoom(roomNumber: string) {
    return await this.prisma.roomAsset.findMany({
      where: { roomNumber },
      include: {
        assetType: true,
      },
    });
  }
}

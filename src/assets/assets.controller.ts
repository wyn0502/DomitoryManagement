import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AssetsService } from './assets.service';

class CreateAssetTypeDto {
  name: string;
  description?: string;
}

class UpdateAssetTypeDto {
  name?: string;
  description?: string;
}

class AssignAssetToRoomDto {
  roomNumber: string;
  assetTypeId: string;
  quantity: number;
  condition?: string; // 'New', 'Old', 'Broken'
}

class UpdateRoomAssetDto {
  quantity?: number;
  condition?: string;
}

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // ===== Asset Type CRUD =====

  /**
   * Create a new asset type
   * POST /assets/types
   */
  @Post('types')
  async createAssetType(@Body() dto: CreateAssetTypeDto) {
    return this.assetsService.createAssetType(dto.name, dto.description);
  }

  /**
   * Get all asset types
   * GET /assets/types
   */
  @Get('types')
  async getAssetTypes() {
    return this.assetsService.getAssetTypes();
  }

  /**
   * Get asset type by ID
   * GET /assets/types/:id
   */
  @Get('types/:id')
  async getAssetTypeById(@Param('id') id: string) {
    return this.assetsService.getAssetTypeById(id);
  }

  /**
   * Update asset type
   * PUT /assets/types/:id
   */
  @Put('types/:id')
  async updateAssetType(
    @Param('id') id: string,
    @Body() dto: UpdateAssetTypeDto,
  ) {
    return this.assetsService.updateAssetType(id, dto.name, dto.description);
  }

  /**
   * Delete asset type
   * DELETE /assets/types/:id
   */
  @Delete('types/:id')
  async deleteAssetType(@Param('id') id: string) {
    return this.assetsService.deleteAssetType(id);
  }

  // ===== Room Assets (Allocation) =====

  /**
   * Assign asset to room
   * POST /assets/room-assets
   */
  @Post('room-assets')
  async assignAssetToRoom(@Body() dto: AssignAssetToRoomDto) {
    return this.assetsService.assignAssetToRoom(
      dto.roomNumber,
      dto.assetTypeId,
      dto.quantity,
      dto.condition,
    );
  }

  /**
   * Get all room assets or filter by room
   * GET /assets/room-assets?roomNumber=101
   */
  @Get('room-assets')
  async getRoomAssets(@Query('roomNumber') roomNumber?: string) {
    return this.assetsService.getRoomAssets(roomNumber);
  }

  /**
   * Get room asset by ID
   * GET /assets/room-assets/:id
   */
  @Get('room-assets/:id')
  async getRoomAssetDetail(@Param('id') id: string) {
    return this.assetsService.getRoomAssetDetail(id);
  }

  /**
   * Update room asset
   * PUT /assets/room-assets/:id
   */
  @Put('room-assets/:id')
  async updateRoomAsset(
    @Param('id') id: string,
    @Body() dto: UpdateRoomAssetDto,
  ) {
    return this.assetsService.updateRoomAsset(id, dto.quantity, dto.condition);
  }

  /**
   * Delete room asset
   * DELETE /assets/room-assets/:id
   */
  @Delete('room-assets/:id')
  async deleteRoomAsset(@Param('id') id: string) {
    return this.assetsService.deleteRoomAsset(id);
  }

  /**
   * Get all assets in a specific room
   * GET /assets/rooms/:roomNumber
   */
  @Get('rooms/:roomNumber')
  async getRoomAssetsByRoom(@Param('roomNumber') roomNumber: string) {
    return this.assetsService.getRoomAssetsByRoom(roomNumber);
  }
}

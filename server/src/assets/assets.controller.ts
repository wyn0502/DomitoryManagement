import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  // =========== PUBLIC (cần đăng nhập) – danh mục tài sản ===========

  @UseGuards(AuthGuard)
  @Get()
  async findAllAssets() {
    return this.assetsService.findAllAssets();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOneAsset(@Param('id') id: string) {
    const nid = parseInt(id, 10);
    return this.assetsService.findOneAsset(nid);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createAsset(@Body() dto: { name: string; description?: string }) {
    return this.assetsService.createAsset(dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async updateAsset(@Param('id') id: string, @Body() dto: { name?: string; description?: string }) {
    return this.assetsService.updateAsset(parseInt(id, 10), dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async removeAsset(@Param('id') id: string) {
    return this.assetsService.removeAsset(parseInt(id, 10));
  }

  // =========== PHÂN BỔ TÀI SẢN VÀO PHÒNG ===========

  // Lấy danh sách phân bổ cho 1 phòng (sinh viên xem thiết bị phòng mình)
  @UseGuards(AuthGuard)
  @Get('room/:roomId')
  async findRoomAssets(@Param('roomId') roomId: string) {
    return this.assetsService.findRoomAssetsByRoom(parseInt(roomId, 10));
  }

  // Lấy TẤT CẢ phân bổ (admin xem tổng quan)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('allocations/all')
  async findAllAllocations() {
    return this.assetsService.findAllRoomAllocations();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post('allocations')
  async allocateAsset(@Body() dto: {
    room_id: number;
    asset_id: number;
    quantity: number;
    status?: 'new' | 'used' | 'broken';
  }) {
    return this.assetsService.allocateAssetToRoom(dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put('allocations/:id')
  async updateAllocation(
    @Param('id') id: string,
    @Body() dto: { quantity?: number; status?: 'new' | 'used' | 'broken' },
  ) {
    return this.assetsService.updateAllocation(parseInt(id, 10), dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('allocations/:id')
  async removeAllocation(@Param('id') id: string) {
    return this.assetsService.removeAllocation(parseInt(id, 10));
  }
}
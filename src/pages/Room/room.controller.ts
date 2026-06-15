import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto } from './room.dto';
import { Room } from './room.entity';
import { RoomStatusService } from './room-status.service';

@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly roomStatusService: RoomStatusService,
  ) {}

  /**
   * Helper method: Thêm status và thông tin lấp đầy vào phòng
   * - status: 'full' | 'available' | 'empty'
   * - availableSlots: số chỗ trống còn lại
   * - occupancyPercentage: % lấp đầy phòng
   */
  private enrichRoomWithStatus(room: Room): any {
    return {
      ...room,
      status: this.roomStatusService.getStatus(room),
      availableSlots: this.roomStatusService.getAvailableSlots(room),
      occupancyPercentage: this.roomStatusService.getOccupancyPercentage(room),
    };
  }

  /**
   * Lấy danh sách tất cả các phòng hoặc lọc theo buildingId
   * GET /rooms
   * GET /rooms?buildingId=1
   * - Nếu có tham số buildingId, trả về danh sách phòng của tòa nhà đó
   * - Nếu không có tham số, trả về tất cả phòng
   * - Mỗi phòng được trả về kèm status (full/available/empty), availableSlots, occupancyPercentage
   */
  @Get()
  findAll(@Query('buildingId') buildingId?: string): any[] {
    let rooms: Room[];
    if (buildingId) {
      rooms = this.roomService.findByBuildingId(+buildingId);
    } else {
      rooms = this.roomService.findAll();
    }
    // Thêm status info vào mỗi phòng
    return rooms.map(room => this.enrichRoomWithStatus(room));
  }

  /**
   * Lấy danh sách phòng theo tòa nhà
   * GET /rooms/building/:buildingId
   * - Trả về tất cả phòng thuộc một tòa nhà cụ thể
   * - Ví dụ: /rooms/building/1 -> lấy tất cả phòng của tòa nhà ID 1
   * - Mỗi phòng được trả về kèm status, availableSlots, occupancyPercentage
   */
  @Get('building/:buildingId')
  findByBuilding(@Param('buildingId') buildingId: string): any[] {
    const rooms = this.roomService.findByBuildingId(+buildingId);
    return rooms.map(room => this.enrichRoomWithStatus(room));
  }

  /**
   * Lấy thông tin chi tiết của một phòng theo ID
   * GET /rooms/:id
   * - Trả về thông tin đầy đủ của phòng có ID cụ thể
   * - Ví dụ: /rooms/5 -> lấy thông tin phòng ID 5
   * - Kèm status, availableSlots, occupancyPercentage
   */
  @Get(':id')
  findOne(@Param('id') id: string): any {
    const room = this.roomService.findOne(+id);
    return this.enrichRoomWithStatus(room);
  }

  /**
   * Tạo một phòng mới
   * POST /rooms
   * - Nhận dữ liệu phòng từ request body
   * - Tạo phòng với thông tin: số phòng, tòa nhà, loại phòng, giá, sức chứa, v.v.
   * - Trả về phòng vừa tạo với ID và status info
   */
  @Post()
  create(@Body() createRoomDto: CreateRoomDto): any {
    const room = this.roomService.create(createRoomDto);
    return this.enrichRoomWithStatus(room);
  }

  /**
   * Cập nhật thông tin của một phòng
   * PUT /rooms/:id
   * - Nhận ID phòng từ URL parameter
   * - Cập nhật các trường được cung cấp trong request body
   * - Các trường không bắt buộc (optional) có thể được cập nhật một phần
   * - Trả về phòng đã cập nhật kèm status info
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto): any {
    const room = this.roomService.update(+id, updateRoomDto);
    return this.enrichRoomWithStatus(room);
  }

  /**
   * Xóa một phòng
   * - Nhận ID phòng từ URL parameter
   * - Xóa phòng có ID cụ thể khỏi database
   * - Trả về kết quả xóa (thường là số bản ghi bị ảnh hưởng hoặc thông báo thành công)
   */
  @Delete(':id')
  remove(@Param('id') id: string): any {
    return this.roomService.remove(+id);
  }
}

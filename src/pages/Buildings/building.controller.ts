import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { BuildingService } from './building.service';
import { CreateBuildingDto, UpdateBuildingDto } from './building.dto';
import { Building } from './building.entity';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  /**
   * Lấy danh sách tất cả các tòa nhà
   * - Trả về danh sách toàn bộ các tòa nhà trong hệ thống
   */
  @Get()
  findAll() {
    return this.buildingService.findAll();
  }

  /**
   * Lấy thông tin chi tiết của một tòa nhà theo ID
   * - Trả về thông tin đầy đủ của tòa nhà có ID cụ thể
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buildingService.findOne(+id);
  }

  /**
   * Tạo một tòa nhà mới
   * - Nhận dữ liệu tòa nhà từ request body
   * - Tạo tòa nhà với thông tin: tên, địa chỉ, v.v.
   * - Trả về tòa nhà vừa tạo với ID
   */
  @Post()
  create(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingService.create(createBuildingDto);
  }

  /**
   * Cập nhật thông tin của một tòa nhà
   * - Nhận ID tòa nhà từ URL parameter
   * - Cập nhật các trường được cung cấp trong request body
   * - Các trường không bắt buộc (optional) có thể được cập nhật một phần
   * - Trả về tòa nhà đã cập nhật
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateBuildingDto: UpdateBuildingDto) {
    return this.buildingService.update(+id, updateBuildingDto);
  }

  /**
   * Xóa một tòa nhà
   * - Nhận ID tòa nhà từ URL parameter
   * - Xóa tòa nhà có ID cụ thể khỏi database
   * - Trả về kết quả xóa (thường là số bản ghi bị ảnh hưởng hoặc thông báo thành công)
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buildingService.remove(+id);
  }
}

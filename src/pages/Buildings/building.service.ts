import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Building } from './building.entity';
import { CreateBuildingDto, UpdateBuildingDto } from './building.dto';

@Injectable()
export class BuildingService {
  private buildings: Building[] = [];
  private idCounter = 1;

  /**
   * Lấy danh sách tất cả các tòa nhà
   */
  findAll(): Building[] {
    return this.buildings;
  }

  /**
   * Lấy thông tin một tòa nhà theo ID
   */
  findOne(id: number): Building {
    const building = this.buildings.find(building => building.id === id);
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    return building;
  }

  /**
   * Tạo một tòa nhà mới
   */
  create(createBuildingDto: CreateBuildingDto): Building {
    if (!createBuildingDto.name) {
      throw new BadRequestException('Building name is required');
    }

    const building: Building = {
      id: this.idCounter++,
      name: createBuildingDto.name,
      description: createBuildingDto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.buildings.push(building);
    return building;
  }

  /**
   * Cập nhật thông tin tòa nhà
   */
  update(id: number, updateBuildingDto: UpdateBuildingDto): Building {
    const building = this.findOne(id);
    
    const updatedBuilding: Building = {
      ...building,
      ...updateBuildingDto,
      updatedAt: new Date(),
    };

    const index = this.buildings.findIndex(b => b.id === id);
    this.buildings[index] = updatedBuilding;
    return updatedBuilding;
  }

  /**
   * Xóa một tòa nhà
   */
  remove(id: number): Building {
    const index = this.buildings.findIndex(building => building.id === id);
    if (index === -1) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    return this.buildings.splice(index, 1)[0];
  }
}

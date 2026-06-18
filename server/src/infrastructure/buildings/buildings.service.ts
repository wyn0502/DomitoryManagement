import { Injectable, NotFoundException } from '@nestjs/common';
import { Building } from './building.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {
  private readonly buildings: Building[] = [];

  create(dto: CreateBuildingDto): Building {
    const building: Building = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: dto.name,
      address: dto.address,
      description: dto.description ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.buildings.push(building);
    return building;
  }

  findAll(): Building[] {
    return [...this.buildings];
  }

  findOne(id: string): Building {
    const building = this.buildings.find((item) => item.id === id);

    if (!building) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }

    return building;
  }

  update(id: string, dto: UpdateBuildingDto): Building {
    const index = this.buildings.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }

    this.buildings[index] = {
      ...this.buildings[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    return this.buildings[index];
  }

  remove(id: string): boolean {
    const index = this.buildings.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    this.buildings.splice(index, 1);
    return true;
  }
}

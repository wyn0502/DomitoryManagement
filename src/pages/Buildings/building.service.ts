import { Injectable } from '@nestjs/common';

@Injectable()
export class BuildingService {
  private buildings: any[] = [];

  findAll() {
    return this.buildings;
  }

  findOne(id: number) {
    return this.buildings.find(building => building.id === id);
  }

  create(createBuildingDto: any) {
    const building = {
      id: Date.now(),
      ...createBuildingDto,
    };
    this.buildings.push(building);
    return building;
  }

  update(id: number, updateBuildingDto: any) {
    const index = this.buildings.findIndex(building => building.id === id);
    if (index > -1) {
      this.buildings[index] = { ...this.buildings[index], ...updateBuildingDto };
      return this.buildings[index];
    }
    return null;
  }

  remove(id: number) {
    const index = this.buildings.findIndex(building => building.id === id);
    if (index > -1) {
      return this.buildings.splice(index, 1);
    }
    return null;
  }
}

import {Injectable, Inject, NotFoundException} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Building} from './entities/building.entity';
import { CreateBuildingDto } from './dto/create-building.dto';

@Injectable()
export class BuildingsService {
  constructor(
    @Inject('BUILDING_REPOSITORY')
    private buildingsRepository: Repository<Building>,
  ) {}

  async Create(buildingDto: CreateBuildingDto): Promise<Building> {
    const building = this.buildingsRepository.create(buildingDto);
    return this.buildingsRepository.save(building);
  }

  async findAll(): Promise<Building[]> {
    return this.buildingsRepository.find();
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.buildingsRepository.findOne({where: {id}});
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    return building;
  }
 
  async update(id: number, buildingDto: Partial<CreateBuildingDto>): Promise<Building> {
    const building = await this.buildingsRepository.preload({
      id,
      ...buildingDto,
    });
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    return this.buildingsRepository.save(building);
  }

    async remove(id: number): Promise<void> {
        const building = await this.findOne(id);
        await this.buildingsRepository.remove(building);
    }
}
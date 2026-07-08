import {Controller, Get, Post, Put, Delete, Body, Param, UseGuards} from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/buildings')
export class BuildingsController {
  constructor(private buildingsService: BuildingsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() buildingDto) {
    return this.buildingsService.Create(buildingDto);
  }

  @Get()
  async findAll() {
    return this.buildingsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.buildingsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: number, @Body() buildingDto) {
    return this.buildingsService.update(id, buildingDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: number) {
    return this.buildingsService.remove(id);
  }
}
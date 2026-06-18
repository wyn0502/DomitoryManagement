import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ResidentsService } from './residents.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';

@Controller('residents')
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Post()
  create(@Body() dto: CreateResidentDto) {
    return this.residentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.residentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.residentsService.findOne(id);
  }

  @Post(':id/assign-room')
  assignRoom(
    @Param('id') id: string,
    @Body() body: { buildingId: string; roomId: string },
  ) {
    return this.residentsService.assignRoom(id, body.buildingId, body.roomId);
  }

  @Get(':id/contract-status')
  getContractStatus(@Param('id') id: string) {
    return this.residentsService.getContractStatus(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResidentDto,
  ) {
    return this.residentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.residentsService.remove(id);
  }
}

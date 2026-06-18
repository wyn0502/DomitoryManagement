import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoomsService } from '../infrastructure/rooms/rooms.service';
import { Resident } from './resident.entity';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';

@Injectable()
export class ResidentsService {
  private readonly residents: Resident[] = [];

  constructor(private readonly roomsService: RoomsService) {}

  create(dto: CreateResidentDto): Resident {
    const resident: Resident = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fullName: dto.fullName,
      studentId: dto.studentId,
      hometown: dto.hometown,
      phoneNumber: dto.phoneNumber,
      className: dto.className,
      contractStartDate: dto.contractStartDate,
      contractEndDate: dto.contractEndDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.residents.push(resident);
    return resident;
  }

  findAll(): Resident[] {
    return [...this.residents];
  }

  findOne(id: string): Resident {
    const resident = this.residents.find((item) => item.id === id);
    if (!resident) {
      throw new NotFoundException(`Resident with id ${id} not found`);
    }
    return resident;
  }

  update(id: string, dto: UpdateResidentDto): Resident {
    const index = this.residents.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Resident with id ${id} not found`);
    }

    this.residents[index] = {
      ...this.residents[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    return this.residents[index];
  }

  assignRoom(
    id: string,
    buildingId: string,
    roomId: string,
  ): Resident {
    const resident = this.findOne(id);

    if (resident.roomId) {
      throw new BadRequestException(
        `Resident ${resident.studentId} is already assigned to a room`,
      );
    }

    const room = this.roomsService.findOne(buildingId, roomId);

    if (room.occupied >= room.capacity) {
      throw new BadRequestException('Room is already full');
    }

    this.roomsService.assignResident(buildingId, roomId);

    resident.roomId = roomId;
    resident.buildingId = buildingId;
    resident.updatedAt = new Date().toISOString();

    return resident;
  }

  getContractStatus(id: string): {
    status: 'active' | 'expired';
    startDate: string;
    endDate: string;
  } {
    const resident = this.findOne(id);
    const now = new Date();
    const startDate = new Date(resident.contractStartDate);
    const endDate = new Date(resident.contractEndDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Contract dates must be valid ISO dates',
      );
    }

    const status = now >= startDate && now <= endDate ? 'active' : 'expired';

    return {
      status,
      startDate: resident.contractStartDate,
      endDate: resident.contractEndDate,
    };
  }

  remove(id: string): boolean {
    const index = this.residents.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }

    this.residents.splice(index, 1);
    return true;
  }
}

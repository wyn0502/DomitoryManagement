import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { User} from '../auth/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';


@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @Inject('USER_REPOSITORY')
    private readonly usersRepository: Repository<User>,
    @Inject('ROOM_REPOSITORY')
    private readonly roomsRepository: Repository<Room>,
  ) {}

  async createContract(createContractDto: CreateContractDto): Promise<Contract> {
    const { userId, roomId, startDate, endDate, status } = createContractDto;
    //kiem tra xem userID có active hay không
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User khong ton tai hoac inactive');
    }
    //kiem tra xem phong còn trống hay không
    const room = await this.roomsRepository.findOne({ where: { id: roomId } });
    if (!room) {
      throw new Error('Phong khong ton tai hoac inactive');
    }
    //kiem tra xem phong có đầy hay không
    if (room.current_occupancy >= room.capacity) {
      throw new Error('Phong da day');
    }
    //tạo hợp đồng mới
    const contract = this.contractRepository.create({
        userId,
        roomId,
        startDate,
        endDate,
        status: status || 'active',
    });

    //cập nhật số lượng người hiện tại trong phòng
    room.current_occupancy += 1;
    await this.roomsRepository.save(room);

    return this.contractRepository.save(contract);   
  }

  async removeContract(id: number): Promise<void> {
    const contract = await this.contractRepository.findOne({ where: { id }, relations: ['room', 'user'] });
    if (!contract) {
      throw new Error('Hop dong khong ton tai');
    }
    //giam số lượng người hiện tại trong phòng
    contract.room.current_occupancy = Math.max(0, contract.room.current_occupancy - 1);
    await this.roomsRepository.save(contract.room);
    //xóa hợp đồng
    await this.contractRepository.remove(contract);
  }

  async findAll(): Promise<Contract[]> {
    return this.contractRepository.find({ relations: ['user', 'room'] });
  }

  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractRepository.findOne({ where: { id }, relations: ['user', 'room'] });
    if (!contract) {
      throw new Error('Hop dong khong ton tai');
    }
    return contract;
  }
  
  //update cho phép gia hạn endDate và thay đổi status
  async updateContract(id: number, updateContractDto: UpdateContractDto): Promise<Contract> {
    const contract = await this.contractRepository.findOne({ where: { id }, relations: ['room', 'user'] });
    if (!contract) {
      throw new Error('Hop dong khong ton tai');
    }

    const { endDate, status } = updateContractDto;
    if (endDate) {
      contract.endDate = endDate;
    }
    if (status) {
      contract.status = status;
    }
    return this.contractRepository.save(contract);
  }
}
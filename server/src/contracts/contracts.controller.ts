import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contracts')
export class ContractsController {
    constructor(private readonly contractsService: ContractsService) {}

    @Post()
    async create(@Body() createContractDto: CreateContractDto) {
        return this.contractsService.createContract(createContractDto);
    }

    @Get()
    async findAll() {
        return this.contractsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.contractsService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateContractDto: UpdateContractDto) {
        return this.contractsService.updateContract(id, updateContractDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.contractsService.removeContract(id);
    }
}
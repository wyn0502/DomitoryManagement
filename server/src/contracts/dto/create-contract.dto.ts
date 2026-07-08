import {IsInt, IsString, IsOptional} from 'class-validator';

export class CreateContractDto {
  @IsInt()
  userId: number;

  @IsInt()
  roomId: number;

  @IsString()
  startDate: Date;

  @IsString()
  endDate: Date;

  @IsOptional()
  @IsString()
  status: 'active' | 'inactive';
}
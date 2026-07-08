import {IsInt, IsString, IsOptional} from 'class-validator';

export class CreateRoomDto {
  @IsInt()
  building_id: number;

  @IsString()
  room_name: string;

  @IsInt()
  @IsOptional()
  capacity: number;

  @IsInt()
  @IsOptional()
  current_occupancy: number;

  @IsString()
  @IsOptional()
  type: string;

  @IsInt()
  @IsOptional()
  fixed_rent: number;
}
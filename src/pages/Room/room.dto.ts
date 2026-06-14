import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export enum RoomType {
  FOUR_PERSON = '4 người',
  SIX_PERSON = '6 người',
  EIGHT_PERSON = '8 người',
}

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty({ message: 'Room number is required' })
  roomNumber!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Building ID is required' })
  buildingId!: number;

  @IsEnum(RoomType)
  @IsNotEmpty({ message: 'Room type is required' })
  roomType!: RoomType;

  @IsNumber()
  @IsNotEmpty({ message: 'Original price is required' })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  originalPrice!: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Max capacity is required' })
  @Min(1, { message: 'Max capacity must be at least 1' })
  maxCapacity!: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Current occupancy must be greater than or equal to 0' })
  currentOccupancy?: number;
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsNumber()
  @IsOptional()
  buildingId?: number;

  @IsEnum(RoomType)
  @IsOptional()
  roomType?: RoomType;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  originalPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Max capacity must be at least 1' })
  maxCapacity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Current occupancy must be greater than or equal to 0' })
  currentOccupancy?: number;
}

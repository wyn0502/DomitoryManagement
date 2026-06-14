import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @IsNotEmpty({message: 'Name is required'}) 
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateBuildingDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

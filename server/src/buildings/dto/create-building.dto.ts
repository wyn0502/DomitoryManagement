import {IsInt, IsOptional, IsString} from 'class-validator';

export class CreateBuildingDto {
  @IsInt  ()
  id: number;
  
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string | null;
}
import{IsString, IsOptional} from 'class-validator';

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  startDate?: Date;

  @IsOptional()
  @IsString()
  endDate?: Date;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';
}
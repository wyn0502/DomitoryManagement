import { Module } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { BuildingsController } from './buildings.controller';
import { DatabaseModule } from '../database/database.module'; 
import { DataSource } from 'typeorm'; // Hoặc thư viện DB bạn đang dùng
import { Building } from './entities/building.entity'; // 👈 Thay bằng đường dẫn tới Entity Building của bạn

@Module({
  imports: [DatabaseModule], 
  controllers: [BuildingsController],
  providers: [
    BuildingsService,
    // 👈 THÊM ĐOẠN PROVIDER NÀY VÀO ĐÂY:
    {
      provide: 'BuildingRepository',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Building),
      inject: ['DATA_SOURCE'], // Lấy DATA_SOURCE được export từ DatabaseModule
    },
  ],
  exports: [BuildingsService],
})
export class BuildingsModule {}